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

  14 November 2018

*/

var fs = require('fs');
var transform = require('qewd-transform-json').transform;
var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var helpers = require('./helpers');

var config = require('./startup_config.json');
var local_routes = require('./local_routes.json');
var oidc_config_template = require('./oidc-config.json');
var oidc_config = transform(oidc_config_template, global_config, helpers);
console.log('oidc_config = ' + JSON.stringify(oidc_config, null, 2));

var bodyParser;
var app;

config.addMiddleware = function(bp, express, q) {
  bodyParser = bp;
  app = express;
};

local_routes[1].afterRouter = [
  (req, res, next) => {
    console.log('** res.locals.message = ' + JSON.stringify(res.locals.message));
    var messageObj = res.locals.message;
    res.set('content-type', 'text/html');
    if (messageObj.error) {
      var response = '<html><body><h2>Error: ' + messageObj.error + '</h2></body></html>';
      res.send(response);
    }
    else {
      //var response = '<html><body>' + messageObj.html + '</body></html>';
      res.send(messageObj.html);
    }
  }
];

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
      console.log('QEWD Documents created from ' + __dirname + '/documents.json which will now be deleted');
      fs.unlinkSync(__dirname + '/documents.json');
    });
  }


  var self = this;
  var deleteDocuments = (config.delete_documents === true);
  console.log('Wait a couple of seconds for oidc-provider to be available');
  setTimeout(function() {
    var oidcServer = require('qewd-openid-connect');
    oidcServer.call(self, app, bodyParser, oidc_config);
  },2000);
}

module.exports = {
  config: config,
  routes: local_routes,
  onStarted: onStarted
};

