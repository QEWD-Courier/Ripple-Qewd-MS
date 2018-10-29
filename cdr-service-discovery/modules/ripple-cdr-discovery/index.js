/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
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

  08 October 2018

*/

var router = require('qewd-router');

var getDemographics = require('./handlers/getDemographics');
var getHeadingSummary = require('./handlers/getHeadingSummary');
var getHeadingDetail = require('./handlers/getHeadingDetail');

var routes = {
  '/api/patients/:patientId/:heading': {
    GET:  getHeadingSummary
  },
  '/api/discovery/:patientId/:heading': {
    GET:  getHeadingSummary
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    GET: getHeadingDetail
  },
  '/api/demographics/:patientId': {
    GET: getDemographics
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorised) {
      req.qewdSession = this.qewdSessionByJWT.call(this, req);
    }
    return authorised;
  }
};
