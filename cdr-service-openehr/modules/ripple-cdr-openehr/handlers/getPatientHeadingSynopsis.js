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

  23 July 2018

*/

var fetchAndCacheHeading = require('../src/fetchAndCacheHeading');
var tools = require('../src/tools');
var getHeadingBySourceId = require('../src/getHeadingBySourceId');
var getTop3ThingsSummary = require('../top3Things/getTop3ThingsSummarySync');


function getHeadingSynopsisFromCache(patientId, heading, noToDisplayInSynopsis, session, callback) {
  var results = [];
  var patientHeadingCache = session.data.$(['headings', 'byPatientId', patientId]);
  var self = this;

  var count = 0;

  /*
  if (heading === 'top3Things') {
    var summary = getTop3ThingsSummary.call(self, patientId);
    results.push(summary);
    return;
  }
  */

  var headingByDateCache = patientHeadingCache.$([heading, 'byDate']);

  headingByDateCache.forEachChild({direction: 'reverse'}, function(date, dateNode) {
    dateNode.forEachChild(function(sourceId) {
      var summary = getHeadingBySourceId.call(self, sourceId, session, 'synopsis');
      results.push(summary);
      count++;
      if (count === noToDisplayInSynopsis) return true;
    });
    if (count === noToDisplayInSynopsis) return true;
  });
  callback(results);
}


function patientHeadingSynopsis(args, finished) {

  var patientId = args.patientId;

  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;

  if (!heading || heading === '') return finished({error: 'Heading missing or empty'});

  var synopsis = [];
  /*
  if (heading === 'top3Things') {
    var data = getTop3ThingsSummary.call(this, patientId);
    if (data.length !== 0) {
      var summary = data[0];
      synopsis = [
        {sourceId: summary.sourceId, text: summary.name1},
        {sourceId: summary.sourceId, text: summary.name2},
        {sourceId: summary.sourceId, text: summary.name3},
      ];
    }

    return finished({
      heading: heading,
      synopsis: synopsis
    });
  }
  */

  if (!tools.isHeadingValid.call(this, heading)) {
    console.log('*** ' + heading + ' has not yet been added to middle-tier processing');
    return finished([]);
  }
  
  var noToDisplayInSynopsis = this.userDefined.synopsis.maximum; 
  if (args.req.query && args.req.query.maximum) noToDisplayInSynopsis = args.req.query.maximum;
  var session = args.req.qewdSession; // QEWD Session
  var self = this;

  //cacheHeading.call(this, patientId, heading, session, function() {

  fetchAndCacheHeading.call(self, patientId, heading, session, function(response) {
    getHeadingSynopsisFromCache.call(self, patientId, heading, noToDisplayInSynopsis, session, function(results) {
      finished({
        heading: heading,
        synopsis: results
      });
    });
  });
}

module.exports = patientHeadingSynopsis;

