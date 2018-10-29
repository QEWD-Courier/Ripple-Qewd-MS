/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-18 Ripple Foundation Community Interest Company       |
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

  15 October 2018

*/

var request = require('request');
var auth_server = require('./hosts').auth;

module.exports = function(session, callback) {

  var cachedTokenNode = session.data.$('discoveryToken');
  var tokenExpired = true;

  if (cachedTokenNode.exists) {
    var createdAt = cachedTokenNode.$('createdAt').value;
    if ((Date.now() - createdAt) < 55000) {
      tokenExpired = false;
    }
  }
  if (!tokenExpired) {
    callback(false, cachedTokenNode.$('jwt').value);
  }
  else {
    var uri = auth_server.host + auth_server.path;
    var form = {
      client_id:  auth_server.client_id,
      username:   auth_server.username,
      password:   auth_server.password,
      grant_type: auth_server.grant_type
    };

    var params = {
      url: uri,
      method: 'POST',
      form: form,
      json: true
    };

    console.log('** authenticate request: ' + JSON.stringify(params, null, 2));
    request(params, function(error, response, body) {
      console.log('*** authenticate response: ' + JSON.stringify(response, null, 2));
      if (!error) {
        var token = body.access_token;
        cachedTokenNode.$('jwt').value = token;
        cachedTokenNode.$('createdAt').value = Date.now();
        callback(false, token);
      }
      else {

        cachedTokenNode.delete();
        console.log('!!!! error: ' + error);
        callback(error);

      }
    });
  }
};

