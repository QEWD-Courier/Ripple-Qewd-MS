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

  17 January 2018

*/

var openEHR = require('./openEHR');
var getHeadingFromOpenEHRServer = require('./getHeadingFromOpenEHRServer');
var mapNHSNoByHost = require('./mapNHSNoByHost');
var servers;
var noOfServers;

function fetchAndCacheHeading(patientId, heading, session, callback) {

  // fetch a heading from each host, unless the heading for that host is already cached
  //  A heading won't be cached for a host if:
  //    a) it's the first time it's being accessed by the user; or 
  //    b) a new record was posted to the host by any user

  var cachedHeading = session.data.$(['headings', 'byPatientId', patientId, heading, 'byHost']);

  if (!servers) {
    // first time this module is used in the worker
    servers = this.userDefined.openehr;
    noOfServers = 0;
    for (host in servers) {
      noOfServers++;
    }
    openEHR.init.call(this);
  }

  var count = 0;
  var host;
  var self = this;

  for (host in servers) {  
    if (cachedHeading.$(host).exists) {
      count++;
      if (count === noOfServers) {
        if (callback) callback({ok: true});
        return;
      }
    }
    else {
      // fetch heading from host and cache it
      (function(host) {
        openEHR.startSession(host, session, function(openEhrSession) {
          console.log('\nFetchAndCacheHeading: ' + host + '; startSession callback - OpenEhr session = ' + JSON.stringify(openEhrSession));
          if (!openEhrSession || !openEhrSession.id) {
            console.log('\nUnable to establish session on ' + host);
            count++;
            if (count === noOfServers) {
              if (callback) callback({ok: true});
            }
          }
          else {
            mapNHSNoByHost.call(self, patientId, host, openEhrSession, function(ehrId) {
              getHeadingFromOpenEHRServer.call(self, patientId, heading, host, session, openEhrSession, function() {
                openEHR.stopSession(host, openEhrSession.id, session);
                count++;
                if (count === noOfServers) {
                  if (callback) callback({ok: true});
                  return;
                }
              });
            });
          }
        });
      }(host));
    }
  }
}

module.exports = fetchAndCacheHeading;
