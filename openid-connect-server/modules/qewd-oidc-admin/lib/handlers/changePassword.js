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

  02 October 2018

*/

var bcrypt = require('bcrypt');

module.exports = function(messageObj, session, send, finished) {

  var password = messageObj.params.password;

  if (!password || password === '') {
    return finished({error: 'Missing or empty password'});
  }

  // at least 1 upper case
  // at least 1 lower case
  // at least 1 number
  // at least 7 characters long
  var passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{7,})");

  if (!passwordPattern.test(password)) {
    return finished({error: 'Your password does not meet the necessary requirements'});
  }

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  // Update the user's password

  var id = session.data.$('userId').value
  var userDoc = this.db.use('OpenId', 'Access', 'by_id', id);
  userDoc.$('password').value = hash;
  userDoc.$('updatedAt').value = new Date().toISOString();
  userDoc.$('verified').value = true;
  userDoc.$('modifiedBy').value = id;

  var userType = userDoc.$('userType').value;

  finished({
    ok: true,
    mode: userType,
    modal: messageObj.params.modal
  });
};
