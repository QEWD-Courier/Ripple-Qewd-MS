/*

 ----------------------------------------------------------------------------
 | conductor-service-phr: Ripple PHR Conductor MicroService                 |
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

  20 June 2018

*/

var config = require('./startup_config.json');
var ms_hosts = require('./ms_hosts.json');
var ms_routes = require('./ms_routes.json');
var local_routes = require('./local_routes.json');
config.jwt = require('./jwt_secret.json');
var ms_config = require('./ms_config');
var customiseRoutes = require('./customiseRoutes');

config.u_services = ms_config(ms_routes, ms_hosts);
var routes = customiseRoutes(local_routes, config);

config.moduleMap = {
  'ripple-admin': '/opt/qewd/mapped/modules/ripple-admin'
};

var userDefined = require('./userDefined.json');

function onStarted() {

  var documents;
  try {
    documents = require('./documents.json');
  }
  catch(err) {}

  if (documents) {
    var msg = {
      type: 'ewd-save-documents',
      params: {
        documents: documents,
        password: this.userDefined.config.managementPassword
      }
    };
    console.log('Initialising Documents from documents.json');
    this.handleMessage(msg, function(response) {
      console.log('QEWD Documents created from text file');
    });
  }

  /*

  // set up timed event to dump out documents to a text file

  var self = this;
  this.dumpDocumentsTimer = setInterval(function() {
    var msg = {
      type: 'ewd-dump-documents',
      params: {
        rootPath: __dirname,
        fileName: 'documents.json',
        password: self.userDefined.config.managementPassword
      }
    };
    console.log('Saving QEWD Database to documents.json');
    self.handleMessage(msg, function(response) {
      console.log('QEWD Database saved');
    });

  }, 300000);

  this.on('stop', function() {
    console.log('Stopping dumpDocumentsTimer');
    clearInterval(self.dumpDocumentsTimer);
  });

  */

  var now = Math.floor(Date.now()/1000);
  var timeout = this.userDefined.config.initialSessionTimeout;

  var payload = {
    exp: now + timeout,
    iat: now,
    iss: 'qewd.jwt',
    application: 'ripple-openehr-jumper',
    qewd: {authenticated: true},
    timeout: timeout,
    userMode: 'primary_startup'
  };
  var jwt = this.jwt.handlers.updateJWT.call(this, payload);
  console.log('jwt = ' + jwt);

  // now send a build request to openehr microservice

  var message = {
    path: '/api/openehr/jumper/build',
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + jwt
    }
  };
  this.microServiceRouter(message, function(response) {
    console.log('** microService response: ' + JSON.stringify(response));
  });

}

module.exports = {
  config: config,
  routes: routes,
  userDefined: userDefined,
  onStarted: onStarted
};
