/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  13 February 2019

*/

var authenticate = require('../src/authenticate');
var getPatientsByNHSNumber = require('../src/getPatientsByNHSNumber');
var getPatientResources = require('../src/getPatientResources');
var getDemographics = require('../src/getDemographics');
var mapToDiscoveryNHSNo = require('../src/mapToDiscoveryNHSNo');

var tools = require('../src/tools');

var dds_config = require('/opt/qewd/mapped/settings/configuration.json').DDS;

module.exports = function(args, finished) {

  var patientId = args.patientId;
  var _this = this;


  // override patientId for PHR Users - only allowed to see their own data

  var nhsNumber = args.session.nhsNumber;

  if (args.session.role === 'phrUser') patientId = nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  if (dds_config && dds_config.mode === 'live') {
    patientId = nhsNumber;
  }
  else {
    // in test mode, map an OpenEHR/Helm patient Id to a DDS test server one
    patientId = mapToDiscoveryNHSNo.call(this, nhsNumber);
  }

  var session = args.req.qewdSession;
  var cachedDemographics = session.data.$(['Demographics', 'by_nhsNumber', nhsNumber]);

  if (typeof cachedDemographics === 'undefined') {
    return finished({error: 'Discovery service unable to identify a valid session'});
  }

  if (cachedDemographics.exists) {
    return finished(cachedDemographics.getDocument(true));
  }

  console.log('\n *** authenticating ***');
  authenticate(session, function(error, token) {
    if (error) {
      return finished({error: error});
    }
    else {
      console.log('\n *** getPatientsByNHSNumber - token = ' + token);
      getPatientsByNHSNumber(patientId, token, session, function(error) {
        if (error) {
          return finished({error: error});
        }
        else {

          getPatientResources(patientId, 'Patient', token, session, function(error) {
            if (error) {
              return finished({error: error});
            }

            var results = getDemographics.call(_this, patientId, session);
            // override the nhsNumber back to the proper one instead of the Discovery-mapped one

            console.log('** /src/getDemographics: ' + JSON.stringify(results, null, 2));

            results.demographics.id = nhsNumber;
            results.demographics.nhsNumber = nhsNumber;
            cachedDemographics.setDocument(results);

            finished(results);

          });
        }
      });
    }
  });

  return;
};
