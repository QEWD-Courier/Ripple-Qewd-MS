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

  1 November 2018

*/

var router = require('qewd-router');

var getMyHeadingSummary = require('./handlers/getMyHeadingSummary');
var getHeadingSummary = require('./handlers/getHeadingSummary');
var getMyHeadingDetail = require('./handlers/getMyHeadingDetail');
var getHeadingDetail = require('./handlers/getHeadingDetail');
var getMySynopsis = require('./handlers/getMySynopsis');
var getPatientSynopsis = require('./handlers/getPatientSynopsis');
var getPatientHeadingSynopsis = require('./handlers/getPatientHeadingSynopsis');
var postMyHeading = require('./handlers/postMyHeading');
var postPatientHeading = require('./handlers/postPatientHeading');
var editPatientHeading = require('./handlers/editPatientHeading');
var deletePatientHeading = require('./handlers/deletePatientHeading');

var getHeadingSummaryFields = require('./handlers/getSummaryHeadingFields');

var getTop3ThingsSummary = require('./top3Things/getTop3ThingsSummary');
var getTop3ThingsDetail = require('./top3Things/getTop3ThingsDetail');
var postTop3Things = require('./top3Things/postTop3Things');

var getFeedSummary = require('./feeds/getSummary');
var getFeedDetail = require('./feeds/getDetail');
var postFeed = require('./feeds/post');
var editFeed = require('./feeds/edit');

var revertDiscoveryData = require('./handlers/revertDiscoveryData');
var revertAllDiscoveryData = require('./handlers/revertAllDiscoveryData');

var checkNHSNumber = require('./handlers/checkNHSNumber');

var mergeDiscoveryData = require('./handlers/mergeDiscoveryData');

var getDiscoveryHeadingData = require('./src/getDiscoveryHeadingData');
var mergeDiscoveryDataInWorker = require('./src/mergeDiscoveryDataInWorker');

var routes = {
  '/api/openehr/check': {
    GET: checkNHSNumber
  },
  '/api/heading/:heading/fields/summary': {
    GET: getHeadingSummaryFields
  },
  '/api/my/heading/:heading': {
    GET: getMyHeadingSummary,
    POST: postMyHeading
  },
  '/api/my/heading/:heading/:sourceId': {
    GET: getMyHeadingDetail
  },
  '/api/my/headings/synopsis': {
    GET: getMySynopsis
  },
  '/api/patients/:patientId/headings/synopsis': {
    GET: getPatientSynopsis
  },
  '/api/patients/:patientId/synopsis/:heading': {
    GET: getPatientHeadingSynopsis
  },
  '/api/patients/:patientId/top3Things': {
    POST: postTop3Things,
     GET: getTop3ThingsSummary
  },
  '/api/patients/:patientId/top3Things/:sourceId': {
    PUT: postTop3Things,
    GET: getTop3ThingsDetail
  },
  '/api/patients/:patientId/:heading': {
    GET:  getHeadingSummary,
    POST: postPatientHeading
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    GET: getHeadingDetail,
    PUT: editPatientHeading,
    DELETE: deletePatientHeading
  },
  '/api/feeds': {
    GET: getFeedSummary,
    POST: postFeed
  },
  '/api/feeds/:sourceId': {
    GET: getFeedDetail,
    PUT: editFeed
  },
  '/discovery/merge/:heading': {
    GET: mergeDiscoveryData
  },
  '/api/discovery/revert/:patientId/:heading': {
    DELETE: revertDiscoveryData
  },
  '/api/discovery/revert/all': {
    DELETE: revertAllDiscoveryData
  },
};

module.exports = {
  init: function() {

    // temporary clear down
    //this.db.use('DiscoveryMap').delete();

    /*
    // temporary clear down
    var phrFeeds = this.db.use('PHRFeeds');
    var feedsById = phrFeeds.$('bySourceId');
    feedsById.forEachChild(function(sourceId, node) {
      var email = node.$('email').value;
      if (email !== 'rtweed@mgateway.com') {
        node.delete();
      }
    });
    */

    //this.db.use('RippleNHSNoMap').delete();

    /*
    var top3Things = this.db.use('Top3Things');
    top3Things.$('bySourceId').forEachChild(function(sourceId, node) {
      var patientId = node.$('patientId').value.toString();
      if (patientId !== '9999999015') {
        top3Things.$(['byPatient', patientId]).delete();
        node.delete();
      }
    });
    */

    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorised) {
      var role = req.session.role;
      console.log('*** role = ' + role + ' *****');
      if (req.path.startsWith('/api/my/') && role !== 'phrUser') {
        finished({error: 'Unauthorised request'});
        console.log('**** attempt to use an /api/my/ path by a non-PHR user ******');
        return false;
      }

      //if (req.path.startsWith('/api/patients/') && role === 'phrUser') {
      //  finished({error: 'Unauthorised request'});
      //  console.log('**** attempt to use an /api/patient/ path by a PHR user ******');
      //  return false;
      //}

      req.qewdSession = this.qewdSessionByJWT.call(this, req);
    }
    return authorised;
  },

  
  workerResponseHandlers: {
    restRequest: function(message, send) {
      //console.log('\n** workerResponseHandler - path = ' + message.path);

      //if (message.path === '/api/patients/:patientId/:heading') {
      if (message.path === '/api/openehr/check') {

        /*

          So at this point, during the /api/initialise process before login,
          we know the NHS Number exists on OpenEHR

          We'll now retrieve the latest Discovery data for the headings
          we're interested in, and write any new records into EtherCIS

          This is managed by a QEWD-stored mapping document which maps
          Discovery Uids to EtherCIS Uids.  If a mapping doesn't exist, 
          then the Discovery record is POSTed to EtherCIS

          Note that the looping through the headings is serialised to 
          prevent flooding EtherCIS with simultaneous requests

        */

        console.log('workerResponseHandler: ' + JSON.stringify(message, null, 2));

        /*
          response from /api/openehr/check (/handlers/checkNHSNumber.js) is:

          {
            "status": "loading_data" | "ready",
            "new_patient": true | false,
            "nhsNumber": {patientId},
            "path": "/api/openehr/check",
            "ewd_application": "ripple-cdr-openehr",
            "token": {jwt}
          }

        */

        if (message.status === 'ready') return;  // Discovery data has been synced
        if (message.responseNo > 1) return; // Discovery data syncing already started by request 1

        var headings = [];
        this.userDefined.synopsis.headings.forEach(function(heading) {
          if (heading !== 'top3Things') headings.push(heading);
        });

        // add a special extra one to signal the end of processing, so the worker
        //  can switch the session record status to 'ready'

        headings.push('finished');

        console.log('** index: headings array: ' + JSON.stringify(headings));

        var _this = this;

        function getNextHeading(index) {
          index++;
          if (index === headings.length) return true; // no more headings
          var heading = headings[index];

          getDiscoveryHeadingData.call(_this, message.nhsNumber, heading, message.token, function(discovery_resp) {
            if (!discovery_resp.message.error) {
              var ok;
              var discovery_data = discovery_resp.message.results;
              // the merging of the Discovery Data has to take place in a worker,
              //  so send the message off to the worker to do it
              mergeDiscoveryDataInWorker.call(_this, message.nhsNumber, heading, message.token, discovery_data, function(responseObj) {
                // now get the next heading
                ok = getNextHeading.call(_this, index);
                if (ok) {
                  // headings all done and session status will be switched to ready
                  // nothing else to do
                  console.log('*** index.js: Discovery data loaded into EtherCIS');
                }
              });
            }
            else {
              // try getting Discovery data for the next heading
              ok = getNextHeading.call(_this, index);
              if (ok) {
                // headings all done, so
                // return the original /api/openehr/check response
                responseObj.message = message;
                //send(responseObj);
              }
            }
          });
        }

        getNextHeading.call(this, -1);

        //return true;

        //we're going to let all this stuff kick off in the background
        //  and meanwhile return the /api/openehr/check response back to the
        //  conductor microservice.  If new_patient is true, it will return a
        //  {status: 'loading_data'} response

        // The Conductor service processes the response to this in ms_config.js

      }
    }
  }
  

};
