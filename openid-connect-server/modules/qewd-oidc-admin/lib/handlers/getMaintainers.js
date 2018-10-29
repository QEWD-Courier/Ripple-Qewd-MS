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

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }
  var userType = session.data.$('userType').value;

  if (userType !== 'admin') {
    return finished({error: 'Invalid request'});
  }

  var usersDoc = this.db.use('OpenId', 'Access');
  var users = [];
  usersDoc.$('by_id').forEachChild(function(id, node) {
    var user = node.getDocument(true);

    users.push({
      id: id,
      email: user.email,
      mobileNo: user.mobileNo,
      name: user.name,
      userType: user.userType,
      verified: user.verified
    });
  });

  finished({
    maintainers: users
  });
};
