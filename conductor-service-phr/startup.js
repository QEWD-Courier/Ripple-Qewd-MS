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

  05 October 2018

*/

var transform = require('qewd-transform-json').transform;
var config = require('./startup_config.json');
var ms_hosts_template = require('./ms_hosts.json');
var ms_routes = require('./ms_routes.json');
var local_routes = require('./local_routes.json');
var ms_config = require('./ms_config');
var customiseRoutes = require('./customiseRoutes');
var helpers = require('./helpers');

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
console.log('global_config = ' + JSON.stringify(global_config, null, 2));

var ms_hosts = transform(ms_hosts_template, global_config, helpers);
console.log('ms_hosts = ' + JSON.stringify(ms_hosts, null, 2));

config.jwt = global_config.jwt;

config.u_services = ms_config(ms_routes, ms_hosts);
var routes = customiseRoutes(local_routes, config);

config.moduleMap = {
  'ripple-admin': 'ripple-admin',
  'ripple-audit-log': 'ripple-audit-log',
  'speedTest': 'speedTest'
};

config.addMiddleware = function(bp, app, _this) {
  //var util = require('util');

  app.use(function(req, res, next) {
    // audit log application must be ready for use
    if (_this.audit_log) {

        //console.log(util.inspect(req));

        var messageObj = {
          url: req.originalUrl,
          method: req.method,
          cookie: req.headers.cookie,
          ip: req.headers['x-forwarded-for'],
          user_agent: req.headers['user-agent'],
          query: req.query,
          body: req.body
        };
        _this.audit_log(messageObj, function(responseObj) {
        });
    }
    next();
  });
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

  // register application to be used for audit logging
  //  and set up re-usable audit function that includes the token etc

  var _this = this;
  var messageObj = {
    type: 'ewd-register',
    application: 'ripple-audit-log'
  };
  this.handleMessage(messageObj, function(responseObj) {
    var token = responseObj.message.token;
    var messageObj = {
      type: 'login',
      token: token,
      params: {
        password: _this.userDefined.config.managementPassword
      }
    };
    _this.handleMessage(messageObj, function(responseObj) {
      if (responseObj.message.ok) {
        _this.audit_log = function(requestObj, callback) {
          var messageObj = {
            type: 'save_to_audit',
            token: token,
            params: requestObj
          };
          _this.handleMessage(messageObj, callback);
        };

        // start keep-alive timed message, to keep token valid for master process lifetime

        _this.keepAliveTimer = setInterval(function() {
          var messageObj = {
            type: 'keepAlive',
            token: token
          };
          _this.handleMessage(messageObj, function(responseObj) {});
        }, 1000000);
      }
    });
  });

  this.on('stop', function() {
    console.log('Stopping keepAliveTimer');
    clearInterval(_this.keepAliveTimer);
  });

}

module.exports = {
  config: config,
  routes: routes,
  userDefined: userDefined,
  onStarted: onStarted
};
