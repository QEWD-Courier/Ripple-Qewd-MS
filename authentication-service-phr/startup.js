/*

 ----------------------------------------------------------------------------
 | authentication-service-phr: Ripple User Authentication MicroService      |
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

  6 February 2018

*/

var config = require('./startup_config.json');
config.jwt = require('./jwt_secret.json');
var local_routes = require('./local_routes.json');

// set userDefined to either Auth0 or OpenId Connect version

//var userDefined = require('./userDefined-auth0.json');
var userDefined = require('./userDefined-openid.json');

module.exports = {
  config: config,
  routes: local_routes,
  userDefined: userDefined
};

