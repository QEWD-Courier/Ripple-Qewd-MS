/*

 ----------------------------------------------------------------------------
 | ripple-openehr-jumper: Automated OpenEHR Template Access                 |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  30 April 2018

*/

var transform = require('qewd-transform-json').transform;
var helpers = require('./helpers');

var formatTemplates = {};

module.exports = function(sourceId, format, session) {

  var sourceIdCache = session.data.$(['headings', 'bySourceId', sourceId]);
  var heading = sourceIdCache.$('heading').value;
  var headingPath = this.userDefined.paths.jumper_templates + heading;

  //console.log('formatResults: record = ' + JSON.stringify(record));
  //console.log('heading: ' + heading);
  //console.log('format ' + format + ' results');
  //console.log('headingPath = ' + headingPath);

  if (format === 'pulsetile' || format === 'fhir') {
    if (!formatTemplates[heading]) formatTemplates[heading] = {};

    if (!formatTemplates[heading][format]) {
      if (format === 'pulsetile') formatTemplates[heading][format] = require(headingPath + '/openEHR_to_Pulsetile.json');
      if (format === 'fhir') formatTemplates[heading][format] = require(headingPath + '/openEHR_to_FHIR.json');
    }
    var template = formatTemplates[heading][format];
    //console.log('template = ' + JSON.stringify(template));

    var cachedRecord = sourceIdCache.$(format);
    var result;
    if (!cachedRecord.exists) {
      var openEHRFormatData = sourceIdCache.$('jumperFormatData').getDocument();
      var result = transform(template, openEHRFormatData, helpers);
      //console.log(format + ' data for ' + sourceId + ' has been transformed and cached');
      //console.log('saving cachedRecord for ' + sourceId + ': ' + JSON.stringify(result));
      cachedRecord.setDocument(result);
    }
    else {
      console.log(format + ' data for ' + sourceId + ' was already cached');
      result = cachedRecord.getDocument();
    }
    return result;
  }
};
