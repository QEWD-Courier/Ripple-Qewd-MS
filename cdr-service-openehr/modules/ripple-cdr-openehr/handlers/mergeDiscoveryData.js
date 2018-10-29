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

  26 October 2018

*/

var postHeading = require('../src/postHeading');
var openEHR = require('../src/openEHR');
var mapNHSNoByHost = require('../src/mapNHSNoByHost');
var deleteSessionCaches = require('../src/deleteSessionCaches');

module.exports = function(args, finished) {

  var session = args.req.qewdSession;
  var heading = args.heading;
  if (heading === 'finished') {
    session.data.$(['record_status', 'status']).value = 'ready';
    return finished({refresh: true});
  }

  args.patientId = args.session.nhsNumber;
  
  //console.log('** mergeDiscoveryData: ' + JSON.stringify(args, null, 2));

  var discovery_data = args.req.data;
  if (discovery_data.length === 0) {
    return finished({refresh: false});
  }

  var jwt = args.req.session;
  var patientId = jwt.nhsNumber;

  console.log('mergeDiscoveryData for ' + patientId + '; ' + heading);

  console.log('** mergeDiscoveryData: ' + JSON.stringify(discovery_data, null, 2));
  //console.log('QEWD session: ' + session.id);

  var discovery_map = this.db.use('DiscoveryMap');
  var discovery_sourceId_index = discovery_map.$('by_discovery_sourceId');
  var openehr_sourceId_index = discovery_map.$('by_openehr_sourceId');
  var cachedHeading = session.data.$(['headings', 'bySourceId']);

  var noOfRecords = discovery_data.length;
  var count = 0;
  var _this = this;
  var refresh_needed = false;

  // before we start the processing loop, obtain an OpenEHR session and ensure an ehrId exists
  //  this ensures it's available for each iteration of the loop instead of each
  //  iteration creating a new one

  // THe posts are serialised - only one at a time, and the next one isn't sent till the
  // previous one gets a response from OpenEHR - so as not to flood the OpenEHR system with POSTs

  var host = this.userDefined.defaultPostHost || 'ethercis';


  /*

  // testing - abort early after a delay ===

  console.log('setTimeout for 15 seconds');
  setTimeout(function() {
    console.log('*** finished!!');
    finished({refresh: true});
  }, 15000);
  console.log('&& return');
  return;


  // ========================================

  */

  openEHR.startSession(host, session, function(openEhrSession) {
    mapNHSNoByHost.call(_this, patientId, host, openEhrSession, function(ehrId) {

      function postNextDiscoveryRecord(recNo) {
        var complete;
        recNo++;
        if (recNo === noOfRecords) return true;  // finished!
        var record = discovery_data[recNo];
        var sourceId = record.sourceId;
        var data;
        if (!discovery_sourceId_index.$(sourceId).exists) {
          console.log('Discovery record ' + sourceId + ' needs to be added to EtherCIS');
          data = {
            data: record,
            format: 'pulsetile',
            source: 'GP'
          };

          postHeading.call(_this, patientId, heading, data, session, function(response) {
 
            console.log('**** response saving Discovery: ' + sourceId + ': ' + JSON.stringify(response, null, 2));
            if (!response) {
              console.log('*** No response returned from OpenEHR for Discovery SourceId ' + sourceId);
            }
            if (!response || response.error || response.ok === false) {
              complete = postNextDiscoveryRecord(recNo);
              if (complete) {
                if (refresh_needed) {
                  deleteSessionCaches.call(_this, patientId, heading, 'ethercis');
                }
                finished({refresh: refresh_needed});
              }
              return;
            }

            refresh_needed = true;
            var openehr_sourceId = 'ethercis-' + response.compositionUid.split('::')[0];
            discovery_sourceId_index.$(sourceId).value = openehr_sourceId;
            openehr_sourceId_index.$(openehr_sourceId).setDocument({
              discovery: sourceId,
              openehr: response.compositionUid,
              patientId: patientId,
              heading: heading
            });

            complete = postNextDiscoveryRecord(recNo);
            if (complete) {
              if (refresh_needed) {
                deleteSessionCaches.call(_this, patientId, heading, 'ethercis');
              }
              finished({refresh: refresh_needed});
            }
          });
        }
        else {
          complete = postNextDiscoveryRecord(recNo);
          if (complete) {
            if (refresh_needed) {
              deleteSessionCaches.call(_this, patientId, heading, 'ethercis');
            }
            finished({refresh: refresh_needed});
          }
        }
      }

      // kick it off
      var complete = postNextDiscoveryRecord(-1);
      if (complete) {
        // if we get here there were no records to post!

        if (refresh_needed) {
          deleteSessionCaches.call(_this, patientId, heading, 'ethercis');
        }
        finished({refresh: refresh_needed});
      }

    });
  });
};

