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

  11 January 2018

*/

var openEHR = require('../openEHR/openEHR');
var headingsLib = require('../headings/headings');
var headings = headingsLib.headings;
var getHeading = headingsLib.getHeading;

function fetchAndCacheHeading(patientId, heading, session, callback) {

  var cachedHeading = session.data.$(['patients', patientId, 'headings', headings[heading].name]);

  if (cachedHeading.exists) {
    if (callback) callback({ok: true});
    return;
  }

  // fetches and caches a heading for a patient

  openEHR.init.call(this);
  var self = this;

  openEHR.startSessions(session, function(openEHRSessions) {
    //console.log('*** sessions: ' + JSON.stringify(openEHRSessions));
    openEHR.mapNHSNo(patientId, openEHRSessions, function() {
      getHeading.call(self, patientId, heading, session, openEHRSessions, function() {
        openEHR.stopSessions(openEHRSessions, session);
        if (callback) callback({ok: cachedHeading.exists});
      });
    });
  });
}

module.exports = fetchAndCacheHeading;
