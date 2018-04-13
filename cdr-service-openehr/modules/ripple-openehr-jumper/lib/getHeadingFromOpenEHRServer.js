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

var mapRawJSON = require('./mapRawJSON');
var buildJSONFile = require('./buildJsonFile');
var addPatientDataToCache = require('./addPatientDataToCache');
var transform = require('qewd-transform-json').transform;
var fs = require('fs-extra');

var helpers = require('./helpers');

var initialised = false;
var templateIndex = {};
var servers;
var formatTemplates = {};

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

function formatResults(record, heading, sourceId, format, headingPath, sourceIdCache) {
  //console.log('formatResults: record = ' + JSON.stringify(record));
  //console.log('format ' + format + ' results');
  //console.log('headingPath = ' + headingPath);

  if (format === 'pulsetile' || format === 'fhir') {
    if (!formatTemplates[heading]) formatTemplates[heading] = {};

    if (!formatTemplates[heading][format]) {
      if (format === 'pulsetile') formatTemplates[heading][format] = require(headingPath + '/openEHR_to_Ripple.json');
      if (format === 'fhir') formatTemplates[heading][format] = require(headingPath + '/openEHR_to_FHIR.json');
    }
    var template = formatTemplates[heading][format];

    var cachedRecord = sourceIdCache.$([sourceId, format]);
    if (!cachedRecord.exists) {
      var result = transform(template, record, helpers);
      //console.log('saving cachedRecord for ' + sourceId + ': ' + JSON.stringify(result));
      cachedRecord.setDocument(result);
    }
  }
}

function pulseTileCache(hostCache, sourceIdCache, heading, headingPath) {

  // uses hostCache: qewdSession.$(['headings', 'byPatientId', patientId, heading, 'byHost', host]);

  hostCache.forEachChild(function(sourceId) {
    //console.log('hostCache sourceId = ' + sourceId);
    var data = sourceIdCache.$([sourceId, 'jumperFormatData']).getDocument();
    //console.log('** data = ' + JSON.stringify(data));
    formatResults(data, heading, sourceId, 'pulsetile', headingPath, sourceIdCache);
  });
}

module.exports = function(params, callback) {

  // called by ripple-cdr-openehd/getHeadingFromOpenEHR Server
  //  retrieving and caching heading data using Jumper instead

  // Note - all this does is fetch the heading from the OpenEHR host
  //  and caches it in the user's session cache.  It does not retrieve
  //  the data

  var patientId = params.patientId;
  var heading = params.heading;
  var host = params.host;
  var qewdSession = params.qewdSession.data;
  var openEHR = params.openEHR;
  var openEHRSession = params.openEHRSession;
  var ehrId = params.ehrId;

  initialise.call(this);
  var templateName = this.userDefined.headings[heading].template.name;  // already checked it exists by now
  var documentName = this.userDefined.documentNames.jumperTemplateFields || 'OpenEHRJumper';
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', templateName]);
  var templateId = templateByName.value;

  var headingPath = __dirname + '/../templates/' + heading;

  console.log('*** ripple-openehr-jumper/getHeadingFromOpenEHRServer: headingPath = ' + headingPath);

  console.log('** templateId = ' + templateId);

  var hostCache = qewdSession.$(['headings', 'byPatientId', patientId, heading, 'byHost', host]);
  var sourceIdCache = qewdSession.$(['headings', 'bySourceId']);
  var results = [];

  // check the byHost cache - if a heading has been added, it will have been deleted

  if (hostCache.exists) {
    // should never get here, but just in case!
    console.log('** jumper/getHeadingFromOpenEHRServer - heading already cached');
    return callback();
  }

  console.log('&& documentName = ' + documentName);
  console.log('&& templateName = ' + templateName);
  console.log('&& templateId = ' + templateId);

  var aqlFields = this.db.use(documentName, 'templateMap', templateId, 'aql').getDocument();  
  var aql = {
    aql: "select a as data from EHR e[ehr_id/value='" + ehrId + "'] contains COMPOSITION a[" + aqlFields.composition + "] where a/name/value='" + aqlFields.name + "'"
  };

  var params = {
    host: host,
    url: '/rest/v1/query',
    method: 'POST',
    options: {
      body: aql
    },
    session: openEHRSession.id,
    logResponse: false
  };

  console.log('Top-level AQL: params = ' + JSON.stringify(params));

  var self = this;

  params.processBody = function(body) {
    console.log('Top level AQL response from ' + host);

    if (body.status === 404) {
      console.log('** error accessing ' + host + ': ' + body.developerMessage);
      return callback({
        error: body.developerMessage
      });
    }

    if (body.error) {
      // no data from host
    }
    else {

      // save a copy of the raw response
      console.log('Top level raw copy saved for ' + host);
      buildJSONFile.call(self, body, headingPath, 'patient_data_raw_example_' + host + '.json');

      var params = {
        data: body,
        templateId: templateId,
        documentName: documentName,
        host: host,
        patientId: patientId
      };

      var resultArr = mapRawJSON.call(self, params);

      // save a copy of the processed results
      console.log('Top level formatted copy saved for ' + host);
      buildJSONFile.call(self, resultArr, headingPath, 'patient_data_formatted_example_' + host + '.json');
      console.log('add ' + host + ' - ' + heading + ' to cache for ' + patientId);
      addPatientDataToCache(resultArr, patientId, host, templateId, heading, qewdSession);

      // finally, create the PulseTile-formatted session cached data

      pulseTileCache(hostCache, sourceIdCache, heading, headingPath);

      console.log('invoke callback');
      callback();

    };
  }
  openEHR.request(params);
};
