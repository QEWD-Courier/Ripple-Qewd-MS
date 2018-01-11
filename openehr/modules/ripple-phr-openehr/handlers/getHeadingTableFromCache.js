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
var headingHelpers = require('../headings/headingHelpers');
var transform = require('qewd-transform-json').transform;

function getHeadingTableFromCache(patientId, heading, session) {

  // The heading records are in the QEWD Session cache
  // Retrieve and transform them

  var cachedHeading = session.data.$(['patients', patientId, 'headings', headings[heading].name]);
  var results = [];

  var template = headings[heading].get.transformTemplate;

  cachedHeading.forEachChild(function(host, hostNode) {

    var helpers = headingHelpers(host, heading, 'get');

    hostNode.forEachChild(function(index, headingNode) {
      //console.log('**** forEachChild index = ' + index);
      var input = headingNode.getDocument();
      var output = transform(template, input, helpers);

      // only send the summary headings

      var summaryFields = headings[heading].headingTableFields;
      summaryFields.push('source');
      summaryFields.push('sourceId');

      var summary = {};
      summaryFields.forEach(function(fieldName) {
        summary[fieldName] = output[fieldName] || '';
      });

      results.push(summary);
    });
  });
  return results;
}

module.exports = getHeadingTableFromCache;
