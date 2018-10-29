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

  27 September 2018

*/

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }

  var userType = session.data.$('userType').value;
  if (userType !== 'admin') {
    return finished({error: 'Invalid request'});
  }

  var email = messageObj.params.id;
  if (typeof email === 'undefined' || email === '') {
    return finished({error: 'Missing User Identifier'});
  }

  var usersDoc = this.db.use('OpenId', 'Access');

  var emailIndex = usersDoc.$(['by_email', email]);
  if (!emailIndex.exists) {
    return finished({error: 'Invalid User Identifier'});
  }

  var id = emailIndex.value;
  var userDoc = usersDoc.$(['by_id', id]);

  if (!userDoc.exists) {
    return finished({error: 'User with id ' + id + ' not found'});
  }

  var username = userDoc.$('username').value;

  var verifyToken = userDoc.$('verify_pending_token').value;
  if (verifyToken !== '') {
    this.db.use('OpenId', 'verify_pending', verifyToken).delete();
  }
  userDoc.delete();
  usersDoc.$(['by_email', email]).delete();
  usersDoc.$(['by_username', username]).delete();

  return finished({
    ok: true
  });

};
