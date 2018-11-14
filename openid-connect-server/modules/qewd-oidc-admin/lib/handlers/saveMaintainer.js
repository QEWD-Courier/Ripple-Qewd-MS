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

  14 November 2018

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

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }

  // only admininstrators can add / maintain users of this service

  var userType = session.data.$('userType').value;
  if (userType !== 'admin') {
    return finished({error: 'Invalid request 2'});
  }

  var email = messageObj.params.email;
  if (!email || email === '') {
    return finished({error: 'Missing or empty Email Address'});
  }

  if (!emailValidator.validate(email) || email.length > 255) {
    return finished({error: 'Invalid Email Address'});
  }

  var userType = messageObj.params.userType;
  if (userType !== 'admin' && userType !== 'userMaint') {
    return finished({error: 'Invalid user type'});
  }

  var name = messageObj.params.name;
  if (!name || name === '') {
    return finished({error: 'Missing or empty Name'});
  }

  var mobileNo = messageObj.params.mobileNo;
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
    return finished({error: 'Invalid request 3'});
  }

  var hcp_id = session.data.$('userId').value;

  if (hcp_id === '') {
    return finished({error: 'Invalid request 4'});
  } 

  var usersDoc = this.db.use('OpenId', 'Access');
  var now = new Date().toISOString();

  if (id === '') {
    // saving a new record
    console.log('** Saving a new Access record');

    if (usersDoc.$(['by_email', email]).exists) {
      return finished({error: 'That Email Address is already in use'});
    }

    id = usersDoc.$('next_id').increment();

    usersDoc.$(['by_id', id]).setDocument({
      email: email,
      password: '',
      verified: false,
      name: name,
      mobileNo: mobileNo,
      userType: userType,
      createdBy: hcp_id,
      createdAt: now,
      modifiedBy: hcp_id,
      updatedAt: now
    });
    usersDoc.$(['by_email', email]).value = id;
  }
  else {
    // updating existing record

    console.log('** Updating Access record for id ' + id);

    var userDoc = usersDoc.$(['by_id', id]);
    if (!userDoc) {
      return finished({error: 'No such User Record Id'});
    }

    var user = userDoc.getDocument(true);

    var old_email = user.email;
    if (email !== old_email) {
      if (usersDoc.$(['by_email', email]).value !== id) {
        return finished({error: 'Email address ' + email + ' is already in use'});
      }
      usersDoc.$(['by_email', email]).value = id;
      usersDoc.$(['by_email', old_email]).delete();
    }

    userDoc.setDocument({
      email: email,
      password: user.password,
      verified: user.verified,
      name: name,
      mobileNo: mobileNo,
      userType: userType,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      modifiedBy: hcp_id,
      updatedAt: now
    });
  }

  return finished({
    ok: true
  });

};
