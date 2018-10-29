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

  25 October 2018


*/

var openEHR = require('./openEHR');
var postFeed = require('../feeds/post');

function checkNHSNumber(patientId, email, session, callback) {

  var host = this.userDefined.defaultPostHost || 'ethercis';

  openEHR.init.call(this);
  var _this = this;

  openEHR.startSession(host, session, function(openEhrSession) {
    console.log('**** inside startSession callback - OpenEhr session = ' + JSON.stringify(openEhrSession));
    if (!openEhrSession || !openEhrSession.id) {
      if (callback) callback({error: 'Unable to establish a session with ' + host});
      return;
    }

    var params = {
      host: host,
      url: '/rest/v1/ehr',
      queryString: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      method: 'GET',
      session: openEhrSession.id,
    };

    console.log('**** about to GET NHS Number check: ' + JSON.stringify(params, null, 2));

    params.processBody = function(body) {
      console.log('&&& OpenEHR response body = ' + JSON.stringify(body, null, 2));
      if (typeof body === 'undefined' || typeof body === 'string') {
        // looks like the nhsNumber doesn't exist so create a 
        //  new OpenEHR record for this NHS Number

        var params = {
          host: host,
          url: '/rest/v1/ehr',
          queryString: {
            subjectId: patientId,
            subjectNamespace: 'uk.nhs.nhs_number'
          },
          method: 'POST',
          session: openEhrSession.id,
          options: {
            body: {
              subjectId: patientId,
              subjectNamespace: 'uk.nhs.nhs_number',
              queryable: 'true',
              modifiable: 'true'
            }
          }
        };
        params.processBody = function(body) {
          console.log('Response from creating new OpenEHR patient = ' + JSON.stringify(body, null, 2));

          // now add the standard feed to it
          //  simulate input from POST /api/feeds

          var args = {
            session: {
              email: email
            },
            req: {
              body: {
                author: 'Helm PHR service',
                name: 'Leeds Live - Whats On',
                landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
                rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
              }
            }
          };

          postFeed.call(_this, args, function(response) {
            console.log('** response from POST Feed: ' + JSON.stringify(response, null, 2));
            callback({
              new_patient: true,
              body: body
            });
          })
        };
        openEHR.request(params);

      }
      else {
        callback({
          new_patient: false,
          body: body
        });
      }
    };

    openEHR.request(params);
  });

}

module.exports = checkNHSNumber;
