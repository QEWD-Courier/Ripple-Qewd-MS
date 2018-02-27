/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-17 Ripple Foundation Community Interest Company       |
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

  30 October 2017

*/

var router = require('qewd-router');
var routes;
var ripple = require('qewd-ripple');

var authenticate = require('qewd-ripple/lib/sessions/authenticate');
var openEHR = require('qewd-ripple/lib/openEHR/openEHR');

var getTemplate = require('./getTemplate');
var getPatientTemplateData = require('./getPatientTemplateData');
var postPatientTemplateData = require('./postPatientTemplateData');

var initialised = false;

module.exports = {

  init: function() {
    if (initialised) return;
    var q = this;
    openEHR.init.call(this);

    routes = [
      {
        url: '/jumper/openehr/template/:templateName',
        method: 'GET',
        handler: getTemplate
      },

      {
        url: '/jumper/openehr/patient/:patientId/template/:templateName',
        method: 'GET',
        handler: getPatientTemplateData
      },

      {
        url: '/jumper/openehr/patient/:patientId/template/:templateName',
        method: 'POST',
        handler: postPatientTemplateData
      }

    ];

    routes = router.initialise(routes, module.exports);
    router.setErrorResponse(404, 'Not Found');
    initialised = true;
  },

  restModule: true,

  beforeHandler: function(messageObj, finished) {

    console.log('beforeHandler - messageObj = ' + JSON.stringify(messageObj));

    // authenticate the request

    var status = authenticate.call(this, messageObj);
    if (status.error) {
      finished(status);
      return false;
    }
    messageObj.session = status.session;
  },
  jumper: require('./jumper')
};

