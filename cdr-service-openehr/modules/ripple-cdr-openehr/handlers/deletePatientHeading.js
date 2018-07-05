/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
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

  27 June 2018

*/

var tools = require('../src/tools');
var deleteHeading = require('../src/deleteHeading');
var fetchAndCacheHeading = require('../src/fetchAndCacheHeading');

function deleteFromSession(session, sourceId) {
  var cachedRecord = session.data.$(['headings', 'bySourceId', sourceId]);
  var heading = cachedRecord.$('heading').value;
  var host = cachedRecord.$('host').value;
  var patientId = cachedRecord.$('patientId').value;
  var date = cachedRecord.$('date').value;

  session.data.$(['headings', 'byHeading', heading, sourceId]).delete();
  var byPatientId = session.data.$(['headings', 'byPatientId', patientId, heading]);
  byPatientId.$(['byDate', date, sourceId]).delete();
  byPatientId.$(['byHost', host, sourceId]).delete();
  cachedRecord.delete();
}

function deletePatientHeading(args, finished) {

  var patientId = args.patientId;
  console.log('\n*** role: ' + args.session.role);

  if (args.session.userMode !== 'admin') {
    return finished({error: 'Invalid request'});
  }

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;
  if (heading && (heading === 'feeds' || heading === 'top3Things')) {
    return finished({error: 'Cannot delete ' + heading + ' records'});
  }

  if (!tools.isHeadingValid.call(this, heading)) {
    return finished({error: 'Invalid or missing heading: ' + heading});
  }

  var sourceId = args.sourceId;

  var session = args.req.qewdSession;
  var self = this;

  fetchAndCacheHeading.call(this, patientId, heading, session, function(response) {
    if (!response.ok) {
      console.log('*** No results could be returned from the OpenEHR servers for heading ' + heading);
      return finished({error: 'No results could be returned from the OpenEHR servers for heading ' + heading});
    }
    else {
      console.log('heading ' + heading + ' for ' + patientId + ' is cached');
      var cachedRecord = session.data.$(['headings', 'bySourceId', sourceId]);
      if (!cachedRecord.exists) {
        return finished({error: 'No existing ' + heading + ' record found for sourceId: ' + sourceId});
      }

      var compositionId = cachedRecord.$(['uid']).value;
      var host = cachedRecord.$(['host']).value;

      if (compositionId === '') {
        return finished({error: 'Composition Id not found for sourceId: ' + sourceId});
      }

      deleteHeading.call(self, patientId, heading, compositionId, host, session, function(response) {
        deleteFromSession(session, sourceId);
        finished(response);
      });
    }
  });
}

module.exports = deletePatientHeading;

