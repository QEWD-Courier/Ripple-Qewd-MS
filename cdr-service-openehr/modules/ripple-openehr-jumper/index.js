/*

 ----------------------------------------------------------------------------
 | ripple-openehr-jumper: Automated OpenEHR Template Access                 |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  9 March 2018

*/

var router = require('qewd-router');

var build = require('./lib/build');

var routes = {
  '/api/openehr/jumper/build': {
    GET: build
  }

};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);

    if (authorised) {
      var userMode = req.session.userMode;
      console.log('*** userMode = ' + userMode + ' *****');
      if (req.path === '/api/openehr/jumper/build' && userMode !== 'admin' && userMode !== 'primary_startup' && userMode !== 'openehr_startup') {
        finished({error: 'Unauthorised request'});
        console.log('**** attempt to use /api/openehr/jumper/build path by a non-admin user ******');
        return false;
      }
    }

    return authorised;
  }
};
