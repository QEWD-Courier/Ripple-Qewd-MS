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

  15 January 2018

*/

var fetchAndCacheHeading = require('../src/fetchAndCacheHeading');
var isPatientIdValid = require('../src/tools').isPatientIdValid;
var getHeadingBySourceId = require('../src/getHeadingBySourceId');

// Headings that make up the synopsis are defined in the userDefined config JSON file

function cacheSummaryHeadings(patientId, session, callback) {

  var count = 0;
  var max = 4;
  var self = this;

  this.userDefined.synopsis.headings.forEach(function(heading) {
    fetchAndCacheHeading.call(self, patientId, heading, session, function(response) {
      count++;
      if (count === max && callback) callback();
    });
  });
}

function getSynopsisFromCache(patientId, max, session, callback) {
  var results = {};
  var patientHeadingCache = session.data.$(['headings', 'byPatientId', patientId]);

  this.userDefined.synopsis.headings.forEach(function(heading) {

    headingByDateCache = patientHeadingCache.$([heading, 'byDate']);
    results[heading] = [];
    var count = 0;

    headingByDateCache.forEachChild({direction: 'reverse'}, function(date, dateNode) {
      dateNode.forEachChild(function(sourceId) {
        var summary = getHeadingBySourceId(sourceId, session, 'synopsis');
        results[heading].push(summary);
        count++;
        if (count === max) return true;
      });
      if (count === max) return true;
    });
  });
  callback(results);
}


function patientSynopsis(args, finished) {

  var self = this;
  var patientId = args.patientId;
  var valid = isPatientIdValid(patientId);
  if (valid.error) return finished(valid);
  
  var max = this.userDefined.synopsis.maximum; 
  if (args.req.query && args.req.query.maximum) max = args.req.query.maximum;
  var session = args.req.qewdSession; // QEWD Session

  cacheSummaryHeadings.call(this, patientId, session, function() {
    getSynopsisFromCache.call(self, patientId, max, session, function(results) {
      finished(results);
    });
  });
}

module.exports = patientSynopsis;

