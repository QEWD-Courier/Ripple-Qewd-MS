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

var headings = require('../headings/headings').headings;
var fetchAndCacheHeading = require('./fetchAndCacheHeading');
var isPatientIdValid = require('../tools').isPatientIdValid;

var headingList = {
  allergies: true,
  medications: true,
  problems: true,
  contacts: true
};

function cacheSummaryHeadings(patientId, session, callback) {

  var count = 0;
  var max = 4;

  for (var heading in headingList) {
    fetchAndCacheHeading.call(this, patientId, heading, session, function(response) {
      count++;
      if (count === max && callback) callback();
    });
  }
}

function getCachedSummary(patientId, session, callback) {
  var results = {};
  for (var heading in headingList) {
    results[heading] = [];
    session.data.$(['patients', patientId, 'headings', heading]).forEachChild(function(host, hostNode) {
      hostNode.forEachChild(function(index, recordNode) {
        var summaryTextFieldName = headings[heading].textFieldName;
        var summaryText = recordNode.$(summaryTextFieldName).value;
        if (summaryText !== null && summaryText !== '') {
          var summary = {
            sourceId: recordNode.$('uid').value.split('::')[0],
            source: host,
            text: summaryText
          }
          results[heading].push(summary);
        }
      });
    });
  }
  callback(results);
}


function patientSummary(args, finished) {

  var patientId = args.patientId;
  var valid = isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var session = args.req.qewdSession; // QEWD Session

  cacheSummaryHeadings.call(this, patientId, session, function() {
    getCachedSummary(patientId, session, function(results) {
      finished(results);
    });
  });
}

module.exports = patientSummary;

