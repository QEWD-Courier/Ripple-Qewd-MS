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
try {
  getFormattedRecordFromCache = require('../../ripple-openehr-jumper/lib/getFormattedRecordFromCache');
}
catch(err) {
  console.log('!*!*!*! unable to load module getFormattedRecordFromCache *!*!*!*!');
}

module.exports = function(sourceId, session, format) {

  // format = synopsis || summary || detail

  if (!sourceId || sourceId === '') return {};
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
  var headingDef = this.userDefined.headings[heading];

  if (getFormattedRecordFromCache && headingDef && headingDef.template) {
    synopsisField = headingDef.synopsisField;
    summaryFields = headingDef.summaryTableFields.slice(0);
  }
  if (!headingMap[heading] && (!synopsisField || !summaryFields)) {
    // load on demand
    headingMap[heading] = require('../headings/' + heading);
  }

  if (!synopsisField) synopsisField = headingMap[heading].textFieldName;
  if (!summaryFields) summaryFields = headingMap[heading].headingTableFields.slice(0); 

  //console.log('getHeadingBySourceId: ');
  //console.log('sourceId: ' + sourceId);
  //console.log('heading: ' + heading);
  //console.log('synopsisField = ' + synopsisField);
  //console.log('cachedObj = ' + JSON.stringify(cachedObj, null, 2));

  //if (cachedObj.pulsetile) console.log('cachedObj.pulsetile: true');
  //if (getFormattedRecordFromCache) console.log('getFormattedRecordFromCache: true');
  //if (cachedObj.jumperFormatData) console.log('cachedObj.jumperFormatData: true');

  if (cachedObj.pulsetile) {
    output = cachedObj.pulsetile;
  }
  else {

    if (getFormattedRecordFromCache && cachedObj.jumperFormatData) {
      // fetch PulseTile-format data from cache
      //  if it hasn't been converted to PulseTile format, this will do so and cache it in that format
      output = getFormattedRecordFromCache.call(this, sourceId, 'pulsetile', session);
    }
    else {
      var host = cachedObj.host;
      var template = headingMap[heading].get.transformTemplate;
      var helpers = headingHelpers(host, heading, 'get');
      output = transform(template, cachedObj.data, helpers);
      output.source = cachedObj.host;
      output.sourceId = sourceId;
      sourceIdCache.$('pulsetile').setDocument(output);
    }
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
