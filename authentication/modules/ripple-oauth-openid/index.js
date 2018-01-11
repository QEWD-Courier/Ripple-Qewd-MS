/*

 ----------------------------------------------------------------------------
 | ripple-oauth-openid: Ripple MicroServices for OAuth OpenId               |
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

  11 January 2018

*/

var router = require('qewd-router');
var oauth_openid = require('./oauth-openid');

var login = require('./handlers/login');
var callback = require('./handlers/callback');
var test = require('./handlers/test');

var routes = {
  '/api/oauth/test': {
    GET: test
  },
  '/api/oauth/login': {
    GET: login
  },
  '/api/oauth/callback': {
    GET: callback
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
    oauth_openid.init.call(this);
  },

  beforeMicroServiceHandler: function(req, finished) {

    var checkIfAuthenticated = true;
    if (req.pathTemplate === '/api/oauth/callback') {
      req.headers.authorization = 'Bearer ' + req.token;
      checkIfAuthenticated = false;
    }

    if (req.path !== '/api/oauth/login') {
      return this.jwt.handlers.validateRestRequest.call(this, req, finished, true, checkIfAuthenticated);
    }
  }
};
