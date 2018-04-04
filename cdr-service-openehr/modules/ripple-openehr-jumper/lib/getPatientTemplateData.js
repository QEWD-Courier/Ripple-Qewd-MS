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

  29 March 2018

*/

var mapRawJSON = require('./mapRawJSON');
var buildJSONFile = require('./buildJsonFile');
var addPatientDataToCache = require('./addPatientDataToCache');
var transform = require('qewd-transform-json').transform;
var fs = require('fs-extra');

var openEHRPath = __dirname + '/../../ripple-cdr-openehr/src/';
var openEHR = require(openEHRPath + 'openEHR');
var tools = require(openEHRPath + 'tools');
var mapNHSNoByHost = require(openEHRPath + 'mapNHSNoByHost');
var helpers = require('./helpers');

var initialised = false;
var templateIndex = {};
var servers;

function initialise() {
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

function formatResults(data, args, headingPath, sourceIdCache) {

  if (args.req.query && args.req.query.format) {
    var format = args.req.query.format.toLowerCase();
    if (format === 'pulsetile' || format === 'fhir') {
      var template;
      if (format === 'pulsetile') template = require(headingPath + '/openEHR_to_Ripple.json');
      if (format === 'fhir') template = require(headingPath + '/openEHR_to_FHIR.json');

      var results = [];
      var result;
      var count = 0;
      data.forEach(function(record) {
        count++;
        var sourceId = record.host + '-' + record.uid.split('::')[0];
        //console.log('formatResults - record.uid = ' + record.uid + '; sourceId = ' + sourceId);

        var cachedRecord = sourceIdCache.$([sourceId, 'data']);
        if (format === 'pulsetile' && cachedRecord.exists) {
          result = cachedRecord.getDocument();
        }
        else {
          result = transform(template, record, helpers);
          //console.log('cachedRecord for ' + sourceId + ': ' + JSON.stringify(cachedRecord.getDocument()));
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
  else {
    return data;
  }
}

function fetchTopLevelAQL(host, patientId, aqlFields, callback) {

  var self = this;

  openEHR.startSession(host, null, function (openEHRSession) {
    mapNHSNoByHost.call(self, patientId, host, openEHRSession, function(ehrId) {
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
        session: openEHRSession.id
      };

      params.processBody = function(body) {
        openEHR.stopSession(host, openEHRSession.id);

        if (body.status === 404) {
          console.log('** error accessing ' + host + ': ' + body.developerMessage);
          return callback({
            error: body.developerMessage
          });
        }

        callback(body, host);
      };

      openEHR.request(params);
    });
  });
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

  var qewdSession = args.req.qewdSession.data;

  var heading = templateIndex[templateName];

  // note - eventually we'll fetch from both
  var host = 'marand';
  //var host = 'ethercis';


  //console.log('templateName = ' + templateName);
  var documentName = this.userDefined.documentNames.jumperTemplateFields || 'OpenEHRJumper';
  //console.log('documentName = ' + documentName);
  var templateId;
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', templateName]);
  if (templateByName.exists) {
    templateId = templateByName.value;
  }
  else {
    return finished({error: 'Template Name is not available for use with this API (2)'});
  }

  var headingPath = __dirname + '/../templates/' + heading;
  var templateCache = qewdSession.$(['headings', 'byTemplateId', templateId]);
  var sourceIdCache = qewdSession.$(['headings', 'bySourceId']);
  var results = [];

  if (templateCache.exists) {
    // fetch from session cache
    templateCache.forEachChild(function(sourceId) {
      var data = sourceIdCache.$([sourceId, 'jumperFormatData']).getDocument();
      results.push(data);
    });

    results = formatResults(results, args, headingPath, host, sourceIdCache);

    return finished(results);

  }

  var aqlFields = this.db.use(documentName, 'templateMap', templateId, 'aql').getDocument();  

  var self = this;
  openEHR.init.call(this);
  var host;
  var resultsByHost = {};
  var noOfServers = 0;
  for (host in this.userDefined.openehr) {
    noOfServers++;
  }
  var count = 0;
  for (host in this.userDefined.openehr) {

    fetchTopLevelAQL.call(this, host, patientId, aqlFields, function(responseObj, server) {
      if (typeof responseObj === 'string') {
        console.log('*** ' + host + ' returned a string, probably an error');
        console.log(responseObj);
        count++;
        if (count === noOfServers) {
          if (results.length > 0) results = formatResults(results, args, headingPath, sourceIdCache);
          finished(results);
        }
      }
      else if (responseObj.error) {
        // no data from host
        count++;
        if (count === noOfServers) {
          if (results.length > 0) results = formatResults(results, args, headingPath, sourceIdCache);
          finished(results);
        }
      }
      else {

        // save a copy of the raw response
        buildJSONFile.call(self, responseObj, headingPath, 'patient_data_raw_example_' + server + '.json');

        var params = {
          data: responseObj,
          templateId: templateId,
          documentName: documentName,
          host: server,
          patientId: patientId
        };

        var resultArr = mapRawJSON.call(self, params);

        // save a copy of the processed results
        buildJSONFile.call(self, resultArr, headingPath, 'patient_data_formatted_example_' + server + '.json');

        addPatientDataToCache(resultArr, patientId, server, templateId, heading, qewdSession);

        /*

        results.forEach(function(result) {
          result.host = host;
          result.patientId = args.patientId;
          result.patientName = patients.$([args.patientId, 'name']).value;
          var composer = result.composer.value;
          var practitionerRecord = practitioners.$(['byName', composer]);
          if (practitionerRecord.exists) {
            result.composer.code = practitionerRecord.$('code').value;
          }
          else {
            var pcode = practitioners.$('no').increment();
            practitioners.$(['byName', composer, 'code']).value = pcode;
            practitioners.$(['byId', pcode]).value = composer;
            result.composer.code = pcode;
          }
        });

        */

        results.push(...resultArr);

        count++;
        if (count === noOfServers) {
          results = formatResults(results, args, headingPath, sourceIdCache);
          finished(results);
        }
      }
    });
  }
};
