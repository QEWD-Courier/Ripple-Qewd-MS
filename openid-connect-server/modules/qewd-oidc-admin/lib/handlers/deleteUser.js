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

  5 September 2018

*/

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }

  var email = messageObj.params.id;
  if (typeof email === 'undefined' || email === '') {
    return finished({error: 'Missing User Identifier'});
  }

  var usersDoc = this.db.use('OpenId', 'Users');

  var emailIndex = usersDoc.$(['by_email', email]);
  if (!emailIndex.exists) {
    return finished({error: 'Invalid User Identifier'});
  }

  var id = emailIndex.value;
  var userDoc = usersDoc.$(['by_id', id]);

  if (!userDoc.exists) {
    return finished({error: 'User with id ' + id + ' not found'});
  }

  var userType = session.data.$('userType').value;
  var userId = session.data.$('userId').value;

  var user = userDoc.getDocument(true);
  console.log('from Users: user id = ' + id + '; ' + JSON.stringify(user, null, 2));
  console.log('userId = ' + userId + '; hcp_id = ' + user.hcp_id);

  if (userType !== 'admin' && userId.toString() !== user.hcp_id.toString()) {
    return finished({error: 'Invalid request 2'});
  }

  userDoc.delete();
  usersDoc.$(['by_email', user.email]).delete();
  if (user.username) {
    usersDoc.$(['by_username', user.username]).delete();
  }
  usersDoc.$(['by_nhsNumber', user.nhsNumber]).delete();
  usersDoc.$(['by_hcp', user.hcp_id, id]).delete();

  return finished({
    ok: true
  });

};
