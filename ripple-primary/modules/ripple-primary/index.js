/*

 ----------------------------------------------------------------------------
 | ripple-phr-primary: Ripple MicroServices for Primary Server              |
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
var routes = require('./routeGenerator');

module.exports = {
  restModule: true,
  init: function() {
    routes = router.initialise(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    console.log('beforeMicroServiceHandler: ' + JSON.stringify(req));
  },
  /*
  workerResponseHandlers: {
    initialise: function(message) {

      var client;
      for (var url in this.u_services.clients) {
        client = this.u_services.clients[url];
        client.send({
          type: 'test',
          hello: 'from primary',
          token: client.token
        });
      }

      console.log('*** initialise worker response handler: ' + JSON.stringify(message));
      return {hello: 'world'};
    }
  }
  */
};