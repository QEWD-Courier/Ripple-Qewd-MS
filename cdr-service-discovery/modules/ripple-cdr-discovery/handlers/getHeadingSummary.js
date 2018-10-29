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

  17 October 2018

*/

var authenticate = require('../src/authenticate');
var getPatientsByNHSNumber = require('../src/getPatientsByNHSNumber');
var getPatientResources = require('../src/getPatientResources');
var getHeadingSummary = require('../src/getHeadingSummary');
var mapToDiscoveryNHSNo = require('../src/mapToDiscoveryNHSNo');

var tools = require('../src/tools');
var headingMap = require('../src/headingMap');

module.exports = function(args, finished) {

  var patientId = args.patientId;


  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  patientId = mapToDiscoveryNHSNo.call(this, patientId);

  //patientId = 5558526785;

  var heading = args.heading;

  if (!headingMap[heading]) {
    return finished({
      responseFrom: 'discovery_service',
      results: []
    });
  }

  var session = args.req.qewdSession;

  var resourceRequired = headingMap[heading];

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
          getPatientResources(patientId, resourceRequired, token, session, function(error) {
            if (error) {
              return finished({error: error});
            }

            var results = getHeadingSummary(patientId, heading, 'pulsetile', session);
            finished(results);

          });
        }
      });
    }
  });

  return;
};
