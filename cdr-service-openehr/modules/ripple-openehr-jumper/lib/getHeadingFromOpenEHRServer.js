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

  28 March 2018

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

function formatResults(data, format, headingPath, sourceIdCache) {
  console.log('format ' + format + ' results');
  console.log('headingPath = ' + headingPath);

  if (format === 'pulsetile' || format === 'fhir') {
    var template;
    if (format === 'pulsetile') template = require(headingPath + '/openEHR_to_Ripple.json');
    if (format === 'fhir') template = require(headingPath + '/openEHR_to_FHIR.json');

    console.log('template = ' + JSON.stringify(template));

    var results = [];
    var result;
    var count = 0;
    data.forEach(function(record) {
      count++;
      var sourceId = record.host + '-' + record.uid.split('::')[0];
      console.log('formatResults - record.uid = ' + record.uid + '; sourceId = ' + sourceId);

      var cachedRecord = sourceIdCache.$([sourceId, format]);
      if (cachedRecord.exists) {
        console.log('record ' + count + ': already cached');
        result = cachedRecord.getDocument();
      }
      else {
        result = transform(template, record, helpers);
        console.log(count + ': creating cachedRecord for ' + sourceId + ': ' + JSON.stringify(result));
        cachedRecord.setDocument(result);
      }
      results.push(result);
    });
    if (format === 'fhir') {
      results = {
        resourceType: 'Bundle',
        total: count,
        entry: results
      };
    }
    return results;
  }
  else {
    return data;
  }
}

function pulseTileCache(templateCache, sourceIdCache, headingPath) {
  var results = [];
  templateCache.forEachChild(function(sourceId) {
    var data = sourceIdCache.$([sourceId, 'jumperFormatData']).getDocument();
    results.push(data);
  });
  results = formatResults(results, 'pulsetile', headingPath, sourceIdCache);
  return results;
}

module.exports = function(params, callback) {

  // called by ripple-cdr-openehd/getHeadingFromOpenEHR Server
  //  retrieving and caching heading data using Jumper instead

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

  var templateCache = qewdSession.$(['headings', 'byTemplateId', templateId]);
  var sourceIdCache = qewdSession.$(['headings', 'bySourceId']);
  var results = [];

  if (templateCache.exists) {
    // fetch from session cache
    console.log('** fetching results from session cache');
    results = pulseTileCache(templateCache, sourceIdCache, headingPath);
    console.log('invoking callback');
    return callback(results);

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
    openEHR.stopSession(host, openEHRSession.id);

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

      pulseTileCache(templateCache, sourceIdCache, headingPath);

      console.log('invoke callback');
      callback();

    };
  }
  openEHR.request(params);
};
