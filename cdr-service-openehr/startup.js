/*

 ----------------------------------------------------------------------------
 | cdr-service-openehr: Ripple MicroServices for OpenEHR                    |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  6 March 2018

*/

var config = require('./startup_config.json');
config.jwt = require('./jwt_secret.json');
var local_routes = require('./local_routes.json');
var userDefined = require('./userDefined.json');


function onStarted() {
  //var jumper = require('./modules/ripple-openehr-jumper');
  //jumper.build.call(this, userDefined.headings);

  var now = Math.floor(Date.now()/1000);
  var timeout = this.userDefined.config.initialSessionTimeout;

  var payload = {
    exp: now + timeout,
    iat: now,
    iss: 'qewd.jwt',
    application: 'ripple-openehr-jumper',
    qewd: {authenticated: true},
    timeout: timeout,
    userMode: 'openehr_startup'
  };
  var jwt = this.jwt.handlers.updateJWT.call(this, payload);

  var message = {
    application: "ripple-openehr-jumper",
    type: "restRequest",
    path: "/api/openehr/jumper/build",
    pathTemplate: "/api/openehr/jumper/build",
    method: "GET",
    token: jwt,
    headers: {
      authorization: 'Bearer ' + jwt
    },
    jwt: true
  };

  this.handleMessage(message, function(response) {
    console.log('*** onStarted response: ' + JSON.stringify(response));
  });

}

module.exports = {
  config: config,
  routes: local_routes,
  onStarted: onStarted
};

