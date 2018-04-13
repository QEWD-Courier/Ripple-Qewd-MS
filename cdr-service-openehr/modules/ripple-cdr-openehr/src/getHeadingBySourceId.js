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

  6 April 2018

*/

var headingHelpers = require('./headingHelpers');
var transform = require('qewd-transform-json').transform;
var headingMap = {};

module.exports = function(sourceId, session, format) {

  // format = synopsis || summary || detail

  format = format || 'detail';
  var sourceIdCache = session.data.$(['headings', 'bySourceId', sourceId]);
  if (!sourceIdCache.exists) return {};

  //console.log('*** sourceId = ' + sourceId);
  var cachedObj = sourceIdCache.getDocument(true);
  //console.log('cachedObj = ' + JSON.stringify(cachedObj));
  var heading = cachedObj.heading;
  var output;
  var synopsisField;
  var summaryFields;

  if (cachedObj.pulsetile) {
    output = cachedObj.pulsetile;
    var headingDef = this.userDefined.headings[heading];
    synopsisField = headingDef.synopsisField;
    //console.log('heading: ' + heading + '; synopsisField = ' + synopsisField);
    //console.log('headingDef: ' + JSON.stringify(headingDef));
    summaryFields = headingDef.summaryTableFields.slice(0);
  }
  else {

    if (!headingMap[heading]) {
      // load on demand
      headingMap[heading] = require('../headings/' + heading);
    }

    var host = cachedObj.host;
    var template = headingMap[heading].get.transformTemplate;
    var helpers = headingHelpers(host, heading, 'get');
    output = transform(template, cachedObj.data, helpers);
    synopsisField = headingMap[heading].textFieldName;
    summaryFields = headingMap[heading].headingTableFields.slice(0);
    output.source = cachedObj.host;
    output.sourceId = sourceId;

  }

  if (format === 'synopsis') {
    // only return the synopsis headings

    return {
      sourceId: sourceId,
      source: host,
      text: output[synopsisField] || ''
    }
  }

  if (format === 'summary') {
    // only return the summary headings

    var results = {};
    summaryFields.push('source');
    summaryFields.push('sourceId');
    summaryFields.forEach(function(fieldName) {
      results[fieldName] = output[fieldName] || '';
    });
    return results;
  }
  else {
    // return detail

    //output.sourceId = sourceId; // over-ride old calculated one
    return output;
  }
};
