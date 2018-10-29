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

  01 October 2018

*/

var moment = require('moment');

module.exports = function(messageObj, session, send, finished) {

  if (!session.authenticated) {
    return finished({error: 'Invalid request 1'});
  }

  var usersDoc = this.db.use('OpenId', 'Users');
  var accessDoc = this.db.use('OpenId', 'Access', 'by_id');
  var userType = session.data.$('userType').value;
  console.log('userType = ' + userType);
  var users = [];
  var hcp_id;
  var owner;

  if (userType === 'admin') {
    usersDoc.$('by_id').forEachChild(function(id, node) {
      var user = node.getDocument(true);
      owner = accessDoc.$([user.hcp_id, 'name']).value;
      if (owner === '') owner = 'Not known';
      users.push({
        id: id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: moment(user.dob).format('DD/MM/YYYY'),
        nhsNumber: user.nhsNumber,
        mobileNumber: user.mobileNumber,
        verified: user.verified,
        owner: owner
      });
    });
  }
  else {
    hcp_id = session.data.$('userId').value;
    owner = accessDoc.$([hcp_id, 'name']).value;
    var userIndex = usersDoc.$('by_id');

    usersDoc.$(['by_hcp', hcp_id]).forEachChild(function(id) {
      var user = userIndex.$(id).getDocument(true);
      users.push({
        id: id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: moment(user.dob).format('DD/MM/YYYY'),
        nhsNumber: user.nhsNumber,
        mobileNumber: user.mobileNumber,
        verified: user.verified,
        owner: owner
      });
    });

  }
  finished({
    users: users
  });
};
