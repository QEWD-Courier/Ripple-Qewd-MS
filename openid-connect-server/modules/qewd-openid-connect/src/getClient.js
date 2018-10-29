/*

 ----------------------------------------------------------------------------
 | qewd-openid-connect: QEWD-enabled OpenId Connect Server                  |
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

  08 October 2018

*/

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var conductor = global_config.phr.microservices.conductor;
var conductorHost = conductor.host + ':' + conductor.port;

function getAClient(clientsDoc, client_id) {
  var id = clientsDoc.$(['by_client_id', client_id]).value;
  var client = clientsDoc.$(['by_id', id]).getDocument(true);
  var post_logout_uri_path = client.post_logout_uri_path;
  var clientObj = {
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uris: [conductorHost + client.redirect_uri_path],
    post_logout_redirect_uris: [conductorHost + post_logout_uri_path]
  };
  // temporary test
  if (client.client_id === 'ltht_helm') {
    clientObj.grant_types = ['client_credentials', 'authorization_code'];
  }
  return clientObj;
}

module.exports = function(messageObj, session, send, finished) {
  var client_id;
  if (messageObj.params) client_id = messageObj.params.id;
  if (!client_id || client_id === '') {
    return finished({error: 'Missing or empty Client Id'});
  }
  var clientsDoc = this.db.use('OpenId', 'Clients');
  var clientIndex = clientsDoc.$(['by_client_id', client_id]);
  if (clientIndex.exists) {
    finished(getAClient(clientsDoc, client_id));
  }
  else {
    finished({error: 'No such Client'});
  }
};
