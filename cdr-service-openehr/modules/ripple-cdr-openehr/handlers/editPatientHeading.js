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

  15 February 2018

*/

var tools = require('../src/tools');
var getHeadingSummary = require('./getHeadingSummary');
var putHeading = require('../src/putHeading');

function editPatientHeading(args, finished) {

  var patientId = args.patientId;

  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;

  if (!tools.isHeadingValid.call(this, heading)) {
    return finished({error: 'Invalid or missing heading: ' + heading});
  }

  var sourceId = args.sourceId;

  var session = args.req.qewdSession;
  var cachedRecord = session.data.$(['headings', 'bySourceId', sourceId]);
  if (!cachedRecord.exists) {
    return finished({error: 'No existing ' + heading + ' record found for sourceId: ' + sourceId});
  }

  var compositionId = cachedRecord.$(['data', 'uid']).value;

  if (compositionId === '') {
    return finished({error: 'Composition Id not found for sourceId: ' + sourceId});
  }

  var body = args.req.body;
  if (!body || body === '' || tools.isEmpty(body)) {
    return finished({error: 'No body content was sent for heading ' + heading});
  }

  putHeading.call(this, patientId, heading, compositionId, body, session, function(response) {
    finished(response);
  });

}

module.exports = editPatientHeading;

