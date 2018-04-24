/*

 ----------------------------------------------------------------------------
 | ripple-openehr-jumper: Automated OpenEHR Template Access                 |
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

  16 April 2018


*/

//var openEHRPath = __dirname + '/../../ripple-cdr-openehr/src/';
var openEHR; // = require(openEHRPath + 'openEHR');
//var mapNHSNoByHost = require(openEHRPath + 'mapNHSNoByHost');
//var deleteSessionCaches = require(openEHRPath + 'deleteSessionCaches');
var sendHeadingData = require('./sendHeadingData');

function sendHeadingToOpenEHR(params, callback) {

  if (!openEHR) {
    var openEHRPath = this.userDefined.paths.openEHR_modules;
    var openEHR = require(openEHRPath + 'openEHR');
    var mapNHSNoByHost = require(openEHRPath + 'mapNHSNoByHost');
    var deleteSessionCaches = require(openEHRPath + 'deleteSessionCaches');
  }

  openEHR.init.call(this);
  var self = this;

  var host = params.defaultHost;
  var qewdSession = params.qewdSession;
  var patientId = params.patientId;
  var heading = params.heading;

  console.log('** jumper/sendHeadingToOpenEHR:');
  console.log('** method = ' + params.method);
  console.log('** compositionId: ' + params.compositionId);

  openEHR.startSession(host, qewdSession, function(openEhrSession) {
    console.log('**** inside postHeadingToOpenEHR/startSession callback - OpenEhr session = ' + JSON.stringify(openEhrSession));
    if (!openEhrSession || !openEhrSession.id) {
      if (callback) callback({error: 'Unable to establish a session with ' + host});
      return;
    }
    mapNHSNoByHost.call(self, patientId, host, openEhrSession, function(ehrId) {
      // force a reload of this heading after the update
      var args = {
        heading: heading,
        ehrId: ehrId,
        host: host,
        openEhrSessionId: openEhrSession.id,
        flatJSON: params.flatJSON,
        method: params.method,
        openEHR: openEHR
      };
      if (params.method === 'put') args.compositionId = params.compositionId;
      sendHeadingData.call(self, args, function(responseObj) {
        console.log('*** sendHeadingData response: ' + JSON.stringify(responseObj));
        openEHR.stopSession(host, openEhrSession.id, qewdSession);
        deleteSessionCaches.call(self, patientId, heading, host);
        if (callback) {
          if (responseObj.data && responseObj.data.compositionUid) {
            callback({
              ok: true,
              host: host,
              heading: heading,
              compositionUid: responseObj.data.compositionUid
            });
          }
          else {
            callback({ok: false});
          }
        }
      });
    });
  });
}

module.exports = sendHeadingToOpenEHR;
