/*

 ----------------------------------------------------------------------------
 | qewd-oidc-admin: Administration Interface for QEWD OpenId Connect Server |
 |                                                                          |
 | Copyright (c) 2018 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  12 October 2018

*/

var emailValidator = require('email-validator');

function isValidNumber(value) {
  var num = +value;
  if (isNaN(num)) return false;
  return (Number.isInteger(num));
}

function matches(string, pattern) {
  var regx = new RegExp(pattern);
  return regx.test(string);
}

function startsWithUpperCaseLetter(text) {
  if (typeof text !== 'string') return false;
  var c1 = text[0];
  if (!isNaN(c1 * 1)) return false;
  return (c1 === c1.toUpperCase());
}

function startsWithLetter(text) {
  if (typeof text !== 'string') return false;
  var c1 = text[0];
  if (!isNaN(c1 * 1)) return false;
  return (matches(text[0], /[a-zA-Z]/i));
}

function isValidDate(string) {
  var d = new Date(string);
  return d instanceof Date && !isNaN(d);
}

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }

  var email = messageObj.params.email;
  if (!email || email === '') {
    return finished({error: 'Missing or empty Email Address'});
  }

  if (!emailValidator.validate(email) || email.length > 255) {
    return finished({error: 'Invalid Email Address'});
  }

  var firstName = messageObj.params.firstName;
  if (!firstName || firstName === '') {
    return finished({error: 'Missing or empty First Name'});
  }

  if (!startsWithUpperCaseLetter(firstName)) {
    return finished({error: 'First Name must start with an Upper-case letter'});
  }

  var lastName = messageObj.params.lastName;
  if (!lastName || lastName === '') {
    return finished({error: 'Missing or empty Last Name'});
  }

  if (!startsWithUpperCaseLetter(lastName)) {
    return finished({error: 'Last Name must start with an Upper-case letter'});
  }

  var dob = messageObj.params.dob;
  if (!dob || dob === '') {
    return finished({error: 'Missing or empty Date of Birth'});
  }

  if (dob.indexOf('/') === -1) {
    return finished({error: 'Date of Birth is invalid'});
  }

  // convert to US format - we'll save it in this format also for ease of conversion

  var pieces = dob.split('/');

  if (pieces.length !== 3) {
    return finished({error: 'Date of Birth is invalid'});
  }

  dob = pieces[1] + '/' + pieces[0] + '/' + pieces[2];

  if (!isValidDate(dob)) {
    return finished({error: 'Date of Birth is invalid'});
  }

  if (new Date(dob).getTime() > Date.now()) {
    return finished({error: 'Date of Birth must be in the past'});
  }

  var nhsNumber = messageObj.params.nhsNumber;
  if (!nhsNumber || nhsNumber === '') {
    return finished({error: 'Missing or empty NHS Number'});
  }

  if (!isValidNumber(nhsNumber)) {
    return finished({error: 'Invalid NHS Number'});
  }

  var mobileNo = messageObj.params.mobileNumber;
  if (!mobileNo || mobileNo === '') {
    return finished({error: 'Missing or empty Mobile Number'});
  }

  // ensure it has at least 1 space in phone No - to ensure it saves OK

  if (mobileNo[0] === '+' && mobileNo.indexOf(' ') === -1) {
    var len = mobileNo.length;
    mobileNo = mobileNo.substring(0, len - 3) + ' ' + mobileNo.substring(len - 3);
  }

  var match = /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*(\d{1,2})$/;
  if (!matches(mobileNo, match)) {
    return finished({error: 'Invalid mobile number'});
  }

  var id = messageObj.params.id;
  if (typeof id === 'undefined') {
    return finished({error: 'Invalid request 2'});
  }

  var hcp_id = session.data.$('userId').value;

  if (hcp_id === '') {
    return finished({error: 'Invalid request'});
  } 

  var usersDoc = this.db.use('OpenId', 'Users');
  var now = new Date().toISOString();

  if (id === '') {
    // saving a new record

    if (usersDoc.$(['by_email', email]).exists) {
      return finished({error: 'That Email Address is already in use'});
    }

    if (usersDoc.$(['by_nhsNumber', nhsNumber]).exists) {
      return finished({error: 'That NHS Number is already in use'});
    }

    id = usersDoc.$('next_id').increment();

    usersDoc.$(['by_id', id]).setDocument({
      email: email,
      password: '',
      verified: false,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      nhsNumber: nhsNumber,
      mobileNumber: mobileNo,
      hcp_id: hcp_id,
      createdBy: hcp_id,
      createdAt: now,
      updatedBy: hcp_id,
      updatedAt: now
    });
    usersDoc.$(['by_email', email]).value = id;
    usersDoc.$(['by_nhsNumber', nhsNumber]).value = id;
    usersDoc.$(['by_hcp', hcp_id, id]).value = id;
  }
  else {
    // updating existing record
    var userDoc = usersDoc.$(['by_id', id]);
    if (!userDoc) {
      return finished({error: 'No such User Record Id'});
    }

    var user = userDoc.getDocument(true);

    var userType = session.data.$('userType').value;

    var old_hcp_id = user.hcp_id;
    if (userType !== 'admin' && old_hcp_id !== hcp_id) {
      return finished({error: 'You are not allowed to update this record'});
    }

    var old_email = user.email;
    if (email !== old_email) {
      if (usersDoc.$(['by_email', email]).exists) {
        return finished({error: 'Email address ' + email + ' is already in use'});
      }
      usersDoc.$(['by_email', email]).value = id;
      usersDoc.$(['by_email', old_email]).delete();
    }

    var old_nhsNumber = user.nhsNumber.toString();
    if (nhsNumber.toString() !== old_nhsNumber) {
      if (usersDoc.$(['by_nhsNumber', nhsNumber]).exists) {
        return finished({error: 'NHS Number ' + nhsNumber + ' is already in use'});
      }
      usersDoc.$(['by_nhsNumber', nhsNumber]).value = id;
      usersDoc.$(['by_nhsNumber', old_nhsNumber]).delete();
    }

    userDoc.setDocument({
      email: email,
      password: user.password,
      verified: user.verified,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      lastName: lastName,
      nhsNumber: nhsNumber,
      mobileNumber: mobileNo,
      hcp_id: user.hcp_id,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      updatedBy: hcp_id,
      updatedAt: now

    });
  }

  return finished({
    ok: true
  });

};
