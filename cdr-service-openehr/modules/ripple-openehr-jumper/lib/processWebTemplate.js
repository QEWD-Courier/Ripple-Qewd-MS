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

  1 May 2018

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

  var parsed = parseWebTemplate(body, platform);
  //return results;

  //var fieldObj = getTemplateFields.call(this, templateName);

  var flatJSON = createFlatJSON(parsed.metadata);
  //templateDoc.$('flatJSON').setDocument(flatJSON);

  filePath = headingPath + '/metaData.json';
  fs.writeJsonSync(filePath, parsed, {spaces: 2});

  var filePath = headingPath + '/flatJSON_template.json';
  fs.writeJsonSync(filePath, flatJSON, {spaces: 2});

  //filePath = headingPath + '/OpenEHR_get_template.json';
  //fs.writeJsonSync(filePath, fieldObj, {spaces: 2});

  // Create JSON Schema for data entry validation, using parse results

  //console.log('Creating JSON Schema for ' + templateName + '; ' + headingPath);
  createJSONSchema(templateName, parsed.metadata, headingPath);

  return {
    ok: true,
    template: templateName,
    //fields: fieldObj,
    flatJSON: flatJSON,
    metadata: parsed
  };
}

module.exports = processWebTemplate;

