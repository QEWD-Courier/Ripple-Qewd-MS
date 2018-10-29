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

  var client_id = messageObj.params.client_id;
  if (!client_id || client_id === '') {
    return finished({error: 'Missing or empty Client Id'});
  }

  var client_secret = messageObj.params.client_secret;
  if (!client_secret || client_secret === '') {
    return finished({error: 'Missing or empty Client Secret'});
  }

  var redirect_uri_path = messageObj.params.redirect_uri_path;
  if (!redirect_uri_path || redirect_uri_path === '') {
    return finished({error: 'Missing or empty Redirect URI Path'});
  }

  var post_logout_uri_path = messageObj.params.post_logout_uri_path;
  if (typeof post_logout_uri_path === 'undefined') {
    return finished({error: 'Missing Post-Logout Redirect URI Path'});
  }

  var id = messageObj.params.id;
  if (typeof id === 'undefined') {
    return finished({error: 'Invalid request 2'});
  }

  var clientsDoc = this.db.use('OpenId', 'Clients');

  if (id === '') {
    // saving a new record

    if (clientsDoc.$(['by_client_id', client_id]).exists) {
      return finished({error: 'A Client with id ' + client_id + ' already exists'});
    }

    id = clientsDoc.$('next_id').increment();
    clientsDoc.$(['by_id', id]). setDocument({
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri_path: redirect_uri_path,
      post_logout_uri_path: post_logout_uri_path
    });
    clientsDoc.$(['by_client_id', client_id]).value = id;
  }
  else {
    // updating existing record
    var clientDoc = clientsDoc.$(['by_id', id]);
    if (!clientDoc) {
      return finished({error: 'No such Client Record Id'});
    }
    var old_client_id = clientDoc.$('client_id').value;

    if (client_id !== old_client_id) {
      if (clientsDoc.$(['by_client_id', client_id]).exists) {
        return finished({error: 'Client_id ' + client_id + ' already exists'});
      }
      clientsDoc.$(['by_client_id', client_id]).value = id;
      clientsDoc.$(['by_client_id', old_client_id]).delete();
    }

    clientDoc. setDocument({
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri_path: redirect_uri_path,
      post_logout_uri_path: post_logout_uri_path
    });

  }

  return finished({
    ok: true
  });

};
