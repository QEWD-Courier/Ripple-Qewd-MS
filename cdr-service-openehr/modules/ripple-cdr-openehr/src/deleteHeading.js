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

  21 June 2018

*/

var openEHR = require('./openEHR');
var mapNHSNoByHost = require('./mapNHSNoByHost');
var deleteSessionCaches = require('./deleteSessionCaches');

function deleteHeadingRecord(host, sourceId, sessionId, callback) {
  var params = {
    host: host,
    callback: callback,
    url: '/rest/v1/composition/' + sourceId,
    method: 'DELETE',
    session: sessionId
  };
  console.log('**** about to delete: ' + JSON.stringify(params, null, 2));
  openEHR.request(params);
}

function deleteHeading(patientId, heading, compositionId, host, qewdSession, callback) {

  openEHR.init.call(this);
  var self = this;

  openEHR.startSession(host, qewdSession, function(openEhrSession) {
    console.log('**** inside deleteHeading/startSession callback - OpenEhr session = ' + JSON.stringify(openEhrSession));
    if (!openEhrSession || !openEhrSession.id) {
      if (callback) callback({error: 'Unable to establish a session with ' + host});
      return;
    }
    deleteHeadingRecord(host, compositionId, openEhrSession.id, function() {
      openEHR.stopSession(host, openEhrSession.id, qewdSession);
      //deleteSessionCaches.call(self, patientId, heading, host);
      callback({
        deleted: true,
        patientId: patientId,
        heading: heading,
        compositionId: compositionId,
        host: host
      });
    });
  });
}

module.exports = deleteHeading;
