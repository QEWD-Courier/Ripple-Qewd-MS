/*

 ----------------------------------------------------------------------------
 | ripple-phr-hospital: Ripple MicroServices for Hospital System Access     |
 |                          eg PAS, etc                                     |
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

  12 March 2018

*/

var router = require('qewd-router');
var loadPatients = require('./data/loadPatients');

var getDemographics = require('./handlers/getDemographics');
var getPatients = require('./handlers/getPatients');
var getUser = require('./handlers/getUser');
var advancedSearch = require('./handlers/advancedSearch');

var routes = {
  '/api/my/demographics': {
    GET: getDemographics
  },
  '/api/patients': {
    GET: getPatients
  },
  '/api/patients/advancedSearch': {
    POST: advancedSearch
  },
  '/api/patients/:patientId': {
    GET: getDemographics
  },
  '/api/user': {
    GET: getUser
  }

};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
    loadPatients.call(this);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);

    if (authorised) {
      var role = req.session.role;
      console.log('*** role = ' + role + ' *****');
      if (req.path.startsWith('/api/my/') && role !== 'phrUser') {
        finished({error: 'Unauthorised request'});
        console.log('**** attempt to use an /api/my/ path by a non-PHR user ******');
        return false;
      }

      if (req.path.startsWith('/api/patient/') && role === 'phrUser') {
        finished({error: 'Unauthorised request'});
        console.log('**** attempt to use an /api/patient/ path by a PHR user ******');
        return false;
      }
      // get QEWD Session for this user's JWT, or create a new one

      req.qewdSession = this.qewdSessionByJWT.call(this, req);

    }

    return authorised;
  }
};