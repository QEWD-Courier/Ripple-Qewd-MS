/*

 ----------------------------------------------------------------------------
 | ripple-auth: Ripple Authentication MicroServices                         |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  19 Februry 2018

*/

function matches(string, pattern) {
  var regx = new RegExp(pattern);
  return regx.test(string);
}

var bcrypt = require('bcrypt');
var emailValidator = require('email-validator');

module.exports = function(args, finished) {

  if (args.req.body) {

    var adminDoc = this.db.use('RippleAdmin');
    var userType;
    if (args.session.userMode === 'addAdminUser') {
      if (adminDoc.exists) {
        // should never occur, but just in case
        return finished({error: 'At least one Admin User has been created already'});
      }
      userType = 'admin';
    }
    else {
      userType = args.req.body.userType;
      if (!userType || userType === '') {
        return finished({error: 'userType must be defined'});
      }
      if (userType !== 'admin' && userType !== 'idcr') {
        return finished({error: 'userType can only be admin or idcr'});
      }
    }

    var username = args.req.body.username;

    if (!username || username === '') {
      return finished({error: 'You must enter a username'});
    }

    if (!matches(username, /^[a-zA-Z0-9]+$/)) {
      return finished({error: 'Invalid username format'});
    }

    if (username.length > 50) {
      return finished({error: 'Username is more than 50 characters'});
    }

    if (username.length < 4) {
      return finished({error: 'Username is too short'});
    }

    var usernameIndex = adminDoc.$(['byUsername', username]);
    if (usernameIndex.exists) {
      return finished({error: 'Username ' + username + ' has already been taken'});
    } 

    var password = args.req.body.password;

    if (!password || password === '') {
      return finished({error: 'You must enter a password'});
    }

    if (password.length < 6) {
      return finished({error: 'Password is too short'});
    }

    var givenName = args.req.body.givenName;
    if (!givenName || givenName === '') {
      return finished({error: 'You must enter a First Name'});
    }

    if (!matches(givenName, /^[a-z ,.'-]+$/i)) {
      return finished({error: 'Invalid First Name'});
    }

    var familyName = args.req.body.familyName;
    if (!familyName || familyName === '') {
      return finished({error: 'You must enter a Last Name'});
    }

    if (!matches(familyName, /^[a-z ,.'-]+$/i)) {
      return finished({error: 'Invalid Last Name'});
    }

    var email = args.req.body.email;
    if (!email || email === '') {
      return finished({error: 'You must enter an Email Address'});
    }

    if (!emailValidator.validate(email) || email.length > 255) {
      return finished({error: 'Invalid Email Address'});
    }

    // validation OK - register the new user

    var id = adminDoc.$('nextId').increment();
    var now = new Date().toISOString();

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    var user = {
      id: id,
      createdAt: now,
      updatedAt: now,
      username: username,
      password: hash,
      type: userType,
      givenName: givenName,
      familyName: familyName,
      email: email
    };

    // save to database
    adminDoc.$(['byId', id]).setDocument(user);
    usernameIndex.value = id;

    return finished({
      ok: true,
      id: id
    });

  }

  finished({error: 'Missing Form Contents'});
 
};
