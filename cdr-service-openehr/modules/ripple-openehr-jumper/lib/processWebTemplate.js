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

  23 March 2018

*/

var path = require('path');
var fs = require('fs-extra');
var parseWebTemplate = require('./parseWebTemplate');
var getTemplateFields = require('./getTemplateFields');
var createFlatJSON = require('./createFlatJSON');
var createJSONSchema = require('./createJSONSchema');
var buildJSONFile = require('./buildJsonFile');

function processWebTemplate(templateName, headingPath, body, host) {

  // save Web Template as a file

  var platform = this.userDefined.openehr[host].platform;
  buildJSONFile.call(this, body, headingPath, 'WebTemplate_' + platform + '.json');

  var results = parseWebTemplate(body, platform);
  //return results;

  var templateId;
  var documentName = this.userDefined.documentNames.jumperTemplateFields || 'OpenEHRJumper';
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', templateName]);
  if (templateByName.exists) {
    templateId = templateByName.value;
  }
  else {
    templateId = templateReg.increment();
    templateByName.value = templateId;
    templateReg.$(['byId', templateId]).value = templateName;
  }

  var templateDoc = this.db.use(documentName, 'templateMap', templateId);
  templateDoc.delete();
  var composition;
  var name;
  if (platform === 'marand') {
    composition = body.webTemplate.tree.nodeId;
    name = body.webTemplate.tree.name;
  }
  else {
    composition = body.tree.node_id;
    name = body.tree.name;
  }

  templateDoc.$('aql').setDocument({
    composition: composition,
    name: name
  });

  templateIndex = templateDoc.$('index');
  templateFields = templateDoc.$('field');
  var fieldId = 0;

  console.log('\n&&&& results: ' + JSON.stringify(results) + '\n');

  results.forEach(function(result) {
    fieldId++;
    var arr = result.pathArr;
    var name = result.name || result.id;
    arr.push(name);
    templateIndex.$(arr).value = fieldId;

    templateFields.$(fieldId).setDocument({
      id: result.id,
      type: result.type,
      path: result.path
    });
  });

  var fieldObj = getTemplateFields.call(this, templateName);

  var flatJSON = createFlatJSON(body);
  templateDoc.$('flatJSON').setDocument(flatJSON);

  var filePath = headingPath + '/flatJSON_template.json';
  fs.writeJsonSync(filePath, flatJSON, {spaces: 2});

  filePath = headingPath + '/OpenEHR_get_template.json';
  fs.writeJsonSync(filePath, fieldObj, {spaces: 2});

  // Create JSON Schema for data entry validation, using parse results

  console.log('Creating JSON Schema for ' + templateName + '; ' + headingPath);
  createJSONSchema(templateName, results, headingPath);

  return {
    ok: true,
    template: templateName,
    fields: fieldObj,
    flatJSON: flatJSON,
    results: results
  };
}

module.exports = processWebTemplate;

