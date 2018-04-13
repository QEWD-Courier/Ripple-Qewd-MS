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

  12 April 2018

*/

var fs = require('fs-extra');
var getPatientDataFromCache = require('./getPatientDataFromCache');
var openEHRPath = __dirname + '/../../ripple-cdr-openehr/src/';
var tools = require(openEHRPath + 'tools');
var fetchAndCacheHeading = require(openEHRPath + 'fetchAndCacheHeading');

var initialised = false;
var templateIndex = {};
var servers;

function initialise() {

  if (initialised) return;

  var templateName;
  var headingObj;
  var getTemplate;

  // create index of templates / headings that are ready for Jumper processing

  for (var heading in this.userDefined.headings) {
    headingObj = this.userDefined.headings[heading];
    if (typeof headingObj === 'object' && headingObj.template && headingObj.template.name) {
      getTemplate = __dirname + '/../templates/' + heading + '/OpenEHR_get_template.json';
      if (fs.existsSync(getTemplate)) {
        templateIndex[headingObj.template.name] = heading;
      }
    }
  }
  servers = this.userDefined.openehr;
  initialised = true;
}

module.exports = function(args, finished) {

  initialise.call(this);

  var patientId = args.patientId;

  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var templateName = args.templateName;

  if (!templateName || templateName === '') {
    return finished({error: 'Template Name not defined or empty'});
  }

  if (typeof templateIndex[templateName] === 'undefined') {
    return finished({error: 'Template is not available for use with this API'});
  }
  var qewdSession = args.req.qewdSession;

  console.log('\nqewdSession = ' + JSON.stringify(qewdSession));

  var heading = templateIndex[templateName];

  var format = 'openehr';
  if (args.req.query && args.req.query.format) {
    format = args.req.query.format.toLowerCase();
    if (format !== 'pulsetile' && format !== 'fhir') format = 'openehr';
  }
  var self = this;

  fetchAndCacheHeading.call(this, patientId, heading, qewdSession, function(response) {
    if (!response.ok) {
      console.log('*** No results could be returned from the OpenEHR servers for heading ' + heading);
      return finished([]);
    }
    else {
      console.log('heading ' + heading + ' for ' + patientId + ' is cached');

      // at this stage, the heading data for the specified patient and template has been
      //  fetched from the OpenEHR servers and cached in the user session, in 2 formats
      //  1) OpenEHR "reference" format and 2) PulseTile format

      //  If a previous request for the data in FHIR format had been made, 
      //   then the data would be already cached in FHIR format also

      getPatientDataFromCache.call(self, patientId, heading, format, qewdSession, function(response) {
        finished(response);
      });
    }
  });
};
