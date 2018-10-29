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

  // temp!!

  //this.db.use('OpenId', 'Access').delete();
  //this.db.use('OpenId', 'verify_pending').delete();
  //this.db.use('OpenId', 'Users').delete();

  //this.db.use('OpenId', 'Access', 'by_id', 1, 'mobileNo').value = '07740857304';

  var accessDoc = this.db.use('OpenId', 'Access', 'by_email');
  var status = 'docEmpty';
  if (accessDoc.exists) status = 'initial';
  finished({status: status});
};
