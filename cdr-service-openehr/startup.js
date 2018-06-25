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

  20 June 2018

*/

var config = require('./startup_config.json');
config.jwt = require('./jwt_secret.json');
var local_routes = require('./local_routes.json');
var userDefined = require('./userDefined.json');


function onStarted() {
  //var jumper = require('./modules/ripple-openehr-jumper');
  //jumper.build.call(this, userDefined.headings);

  // initialise / load database

  var documents;
  try {
    documents = require('./documents.json');
  }
  catch(err) {};

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

  // =================

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

  for (var path in this.userDefined.paths) {
    if (this.userDefined.paths[path].slice(-1) !== '/') {
      this.userDefined.paths[path] = this.userDefined.paths[path] + '/';
    }
  }

}

module.exports = {
  config: config,
  routes: local_routes,
  onStarted: onStarted
};

