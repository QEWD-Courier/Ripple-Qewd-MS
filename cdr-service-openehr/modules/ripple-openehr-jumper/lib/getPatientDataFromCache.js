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

  16 April 2018

*/

var transform = require('qewd-transform-json').transform;
var helpers = require('./helpers');

var jumperModules = {};

module.exports = function(patientId, heading, format, qewdSession, callback) {

  if (format === 'fhir') {

    if (!jumperModules[heading]) {
      jumperModules[heading] = {
        path: this.userDefined.paths.jumper_templates + heading
      };
    }
    var headingPath = jumperModules[heading].path;
    if (!jumperModules[heading].fhir) {
      jumperModules[heading].fhir = require(headingPath + '/openEHR_to_FHIR.json');
    };
    var template = jumperModules[heading].fhir;
  }

  var hostCache = qewdSession.data.$(['headings', 'byPatientId', patientId, heading, 'byHost']);
  var sourceIdCache = qewdSession.data.$(['headings', 'bySourceId']);
  var results = [];
  count = 0;

  hostCache.forEachChild(function(host, hostNode) {
    hostNode.forEachChild(function(sourceId) {

      if (format === 'openehr') {
        results.push(sourceIdCache.$([sourceId, 'jumperFormatData']).getDocument());
        return;
      }
      if (format === 'pulsetile') {
        results.push(sourceIdCache.$([sourceId, 'pulsetile']).getDocument());
        return;
      }

      if (format === 'fhir') {
        var fhirNode = sourceIdCache.$([sourceId, 'fhir']);
        if (fhirNode.exists) {
          results.push(fhirNode.getDocument());
        }
        else {
          // convert to fhir format and cache it
          var openEHRData = sourceIdCache.$([sourceId, 'jumperFormatData']).getDocument();
          var fhir = transform(template, openEHRData, helpers);
          //console.log('cachedRecord for ' + sourceId + ': ' + JSON.stringify(cachedRecord.getDocument()));
          fhirNode.setDocument(fhir);
          results.push(fhir);
        }
        count++;
      }

    });
  });

  if (format === 'fhir') {
    return callback({
      resourceType: 'Bundle',
      total: count,
      entry: results
    });
  }

  callback({
    format: format,
    results: results
  });

};
