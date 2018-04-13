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

  12 April 2018

*/

var openEHR = require('./openEHR');
var mapNHSNoByHost = require('./mapNHSNoByHost');
var deleteSessionCaches = require('./deleteSessionCaches');
var putHeadingData = require('./putHeadingData');

try {
  postHeadingByJumper = require('../../ripple-openehr-jumper/lib/postHeading');
}
catch(err) {
  console.log('Unable to load jumper version of postHeading: ' + err);
}

var headingMap = {};
var defaultHost;

function putHeading(patientId, heading, compositionId, data, qewdSession, callback) {

  if (!defaultHost) {
    defaultHost = this.userDefined.defaultPostHost || 'ethercis';
  }

  if (postHeadingByJumper && this.userDefined.headings[heading] && this.userDefined.headings[heading].template && this.userDefined.headings[heading].template.name) {
    // use Jumper instead to get the heading

    var params = {
      patientId: patientId,
      heading: heading,
      data: data,
      qewdSession: qewdSession,
      defaultHost: defaultHost,
      method: 'put',
      compositionId: compositionId,
    };

    console.log('calling postHeadingByJumper: params = ' + JSON.stringify(params, null, 2));

    postHeadingByJumper.call(this, params, callback);
    return;
  }

  if (!headingMap[heading]) {
    // load on demand
    headingMap[heading] = require('../headings/' + heading);
  }

  if (headingMap[heading].post) {
    var host = headingMap[heading].post.destination || defaultHost;

    openEHR.init.call(this);
    var self = this;

    openEHR.startSession(host, qewdSession, function(openEhrSession) {
      console.log('**** inside putHeading/startSession callback - OpenEhr session = ' + JSON.stringify(openEhrSession));
      if (!openEhrSession || !openEhrSession.id) {
        if (callback) callback({error: 'Unable to establish a session with ' + host});
        return;
      }
      mapNHSNoByHost.call(self, patientId, host, openEhrSession, function(ehrId) {
        // force a reload of this heading after the update
        var params = {
          heading: heading,
          compositionId: compositionId,
          ehrId: ehrId,
          host: host,
          openEhrSessionId: openEhrSession.id,
          data: data,
          headingPostMap: headingMap[heading].post
        };
        putHeadingData.call(self, params, function(responseObj) {
          console.log('*** putHeading response: ' + JSON.stringify(responseObj));
          openEHR.stopSession(host, openEhrSession.id, qewdSession);
          deleteSessionCaches.call(self, patientId, heading, host);
          if (callback) {
            if (responseObj.data && responseObj.data.compositionUid) {
              callback({
                ok: true,
                host: host,
                heading: heading,
                compositionUid: responseObj.data.compositionUid,
                action: responseObj.data.action
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
  else {
    console.log('*** Heading ' + heading + ' either not recognised, or no POST definition available');
    callback({error: 'heading ' + heading + ' not recognised, or no POST definition available'});
  }
}

module.exports = putHeading;
