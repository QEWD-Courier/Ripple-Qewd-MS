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

  var claimsDoc = this.db.use('OpenId', 'Claims');
  var claims = [];
  claimsDoc.$('by_id').forEachChild(function(id, node) {
    var claim = node.getDocument(true);
    var fieldsList = '';
    var fieldsEdit = '';
    var comma = '';
    var delim = '';
    claim.fields.forEach(function (field) {
      fieldsList = fieldsList + comma + field;
      fieldsEdit = fieldsEdit + delim + field;
      comma = ', ';
      delim = '\n';
    });

    claims.push({
      id: id,
      name: claim.name,
      fieldsList: fieldsList,
      fieldsEdit: fieldsEdit
    });
  });
  finished({
    claims: claims
  });
};
