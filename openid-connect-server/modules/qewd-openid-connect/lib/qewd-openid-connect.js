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

  4 July 2018

*/

var documentsPath = '/opt/qewd/mapped/documents.json';

var load = require('./loader');
var qewd_interface = require('./qewd_interface');

var documents;
try {
  documents = require(documentsPath);
}
catch(err) {};

function start(app, bodyParser, params) {

  qewd_interface.call(this);

  var self = this;

  // start the QEWD session for database interactions

  this.send_promise({
    type: 'ewd-register',
    application: 'qewd-openid-connect'
  })
    .then (function(result) {
      self.openid_server.token = result.message.token;

      self.send_promise({
        type: 'login',
        params: {
          password: self.userDefined.config.managementPassword
        }
      })
        .then (function(result) {
  
          // fetch or generate the keystore & config params

          var msg = {type: 'getParams'};
          if (documents) msg.params = {
            documents: documents,
            documentsPath: documentsPath
          };
          self.send_promise(msg)
            .then (function(result) {

              // start up the OpenID Connect Server

              for (var name in result.message) {
                params[name] = result.message[name];
              }

              load.call(self, app, bodyParser, params);
          });
      });
  });
};

module.exports = start;
