/*

 ----------------------------------------------------------------------------
 | ripple-phr-openehr: Ripple MicroServices for OpenEHR                     |
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

  15 January 2018

*/

var fetchAndCacheHeading = require('../src/fetchAndCacheHeading');
var getHeadingDetailFromCache = require('../src/getHeadingDetailFromCache');
var tools = require('../src/tools');

function getDetail(sourceId, session, finished) {
  var results = getHeadingDetailFromCache(sourceId, session);
  finished({
    responseFrom: 'phr_service',
    results: results
  });
}

module.exports = function(args, finished) {

  var patientId = args.patientId;

  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;

  if (!tools.isHeadingValid.call(this, heading)) {
    console.log('*** ' + heading + ' has not yet been added to middle-tier processing');
    return finished([]);
  }

  var sourceId = args.sourceId;
  if (!tools.isSourceIdValid(sourceId)) {
    console.log('*** Invalid SourceId: ' + sourceId);
    return finished([]);
  }

  var session = args.req.qewdSession;

  fetchAndCacheHeading.call(this, patientId, heading, session, function(response) {
    if (!response.ok) {
      console.log('*** No results could be returned from the OpenEHR servers for heading ' + heading);
      return finished([]);
    }
    else {
      console.log('heading ' + heading + ' for ' + patientId + ' is cached');
      getDetail(sourceId, session, finished);
    }
  });

};


