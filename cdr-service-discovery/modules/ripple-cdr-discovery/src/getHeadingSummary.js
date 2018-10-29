/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-18 Ripple Foundation Community Interest Company       |
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

  17 October 2018

*/

var transform = require('qewd-transform-json').transform;
var headingMap = require('./headingMap');
var discovery_helpers = require('./discoveryHelpers');

module.exports = function(nhsNumber, headingName, format, session) {

  var resourceName = headingMap[headingName];
  //console.log('\n *** headingName = ' + headingName);
  //console.log('\n *** resourceName = ' + resourceName);
  //console.log('\n *** nhsNumber = ' + nhsNumber);

  var to_openehr_template = require('../templates/' + headingName + '/discovery_to_openehr.json');

  var to_format_template;
  var format_helpers;
  if (format === 'pulsetile') {
    to_format_template = require('../templates/' + headingName + '/openEHR_to_Pulsetile.json');
    format_helpers = require('./helpers');
  }

  var patientResourceCache = session.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceName]);

  resourceCache = session.data.$(['Discovery', resourceName, 'by_uuid']);
  practitionerCache = session.data.$(['Discovery', 'Practitioner', 'by_uuid']);

  var results = [];

  patientResourceCache.forEachChild(function(uuid) {
    console.log('*** patientResourceCache uuid = ' + uuid);
    var resourceDoc = resourceCache.$(uuid);
    var resource = resourceDoc.$('data').getDocument(true);
    if (resourceDoc.$('practitioner').exists) {
      var practitionerUuid = resourceDoc.$('practitioner').value;
      var practitionerResource = practitionerCache.$([practitionerUuid, 'data']).getDocument(true);
      resource.practitionerName = practitionerResource.name.text;
    }
    else {
      resource.practitionerName = 'Not known';
    }
    resource.nhsNumber = nhsNumber;
    //console.log('resource: ' + JSON.stringify(resource, null, 2));
    var result = transform(to_openehr_template, resource, discovery_helpers);
    //console.log(JSON.stringify(result, null, 2));
    if (to_format_template) {
      result = transform(to_format_template, result, format_helpers);
      //console.log(JSON.stringify(result, null, 2));
    }

    //console.log('=======================');
    results.push(result);  // should be pulsetile format!!
  });
  return results;
};
