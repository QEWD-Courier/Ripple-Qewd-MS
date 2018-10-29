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

  28 September 2018

*/

var bcrypt = require('bcrypt');
var emailValidator = require('email-validator');

function matches(string, pattern) {
  var regx = new RegExp(pattern);
  return regx.test(string);
}

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request'});
  }

  // validate request fields

  var errors = '';
  var colon = '';

  var email = messageObj.params.email;
  if (!email || email === '') {
    errors = errors + colon + 'Missing or empty Email Address';
    colon = '; ';
  }

  var usersDoc = this.db.use('OpenId', 'Access');

  var password = messageObj.params.password;
  if (!password || password === '') {
    errors = errors + colon + 'Missing or empty Password';
    colon = '; ';
  }

  var name = messageObj.params.name;
  if (!name || name === '') {
    errors = errors + colon + 'Missing or empty Name';
    colon = '; ';
  }

  if (errors !== '') {
    return finished({error: errors});
  }

  var userType = messageObj.params.userType;
  if (userType !== 'admin' && userType !== 'userMaint') {
    return finished({error: 'Invalid user type'});
  }

  var emailIndex;
  if (!emailValidator.validate(email) || email.length > 255) {
      errors = errors + colon + 'Email address is invalid';
      colon = '; ';
  }
  else {
    emailIndex = usersDoc.$(['by_email', email]);
    if (emailIndex.exists) {
      errors = errors + colon + 'Email address is already in use';
      colon = '; ';
    }
  }

  if (password.length < 6) {
    errors = errors + colon + 'Password must be 6 or more characters in length';
    colon = '; ';
  }

  var mobileNo = messageObj.params.mobileNo;
  if (!mobileNo || mobileNo === '') {
    errors = errors + colon + 'Missing or empty MobileNo';
    colon = '; ';
  }
  else {
    var match = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/;
    if (!matches(mobileNo, match)) {
      return finished({error: 'Invalid mobile number'});
    }
  }

  if (errors !== '') {
    return finished({error: errors});
  }

  // validation OK - register the new user

  var id = usersDoc.$('next_id').increment();
  var now = new Date().toISOString();

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  var user = {
    id: id,
    email: email,
    mobileNo: mobileNo,
    name: name,
    createdAt: now,
    createdBy: id,
    updatedAt: now,
    updatedBy: id,
    password: hash,
    verified: true,
    userType: userType
  };

  // save to database
  usersDoc.$(['by_id', id]).setDocument(user);
  emailIndex.value = id;

  // all done - return the registered user object, but leave off the password

  if (session.data.$('userType').value === 'addAdminUser') {
    session.authenticated = false;
    session.timeout = 1200;
    session.data.$('userType').delete();
  }

  delete user.password;
  finished({user: user});

};
