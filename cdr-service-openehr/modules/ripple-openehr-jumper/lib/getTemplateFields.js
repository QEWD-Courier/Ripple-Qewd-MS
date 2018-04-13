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

  4 April 2018

*/


module.exports = function(templateName) {

  if (!templateName || templateName === '') {
    return {error: 'Template Name missing or empty'};
  }

  var templateId;
  var documentName = this.userDefined.documentNames.jumperTemplateFields || 'OpenEHRJumper';
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', templateName]);
  if (templateByName.exists) {
    templateId = templateByName.value;
  }
  else {
    return {error: 'Template Name was not recognised'};
  }

  var templateFields = this.db.use(documentName, 'templateMap', templateId, 'field');

  var fieldObj = {
    uid: '{{uid}}',
    composer: {
      value: '{{composer}}'
    },
    host: '{{host}}',
    patientId: '{{patientId}}'
  };

  templateFields.forEachChild(function(fieldNo, node) {
    var pathArr = node.$('path').getDocument(true);
    var id = node.$('id').value;
    var type = node.$('type').value;
    var obj = fieldObj;
    var max = pathArr.length - 1;
    pathArr.forEach(function(name, index) {
      if (typeof obj[name] === 'undefined') obj[name] = {};
      if (index === max) {
        obj[name] = {
          value: '{{' + id + '}}'
        };
        if (type === 'DV_TEXT' || type === 'DV_CODED_TEXT') {
          obj[name].code = '{{' + id + '_codeString}}';
          obj[name].terminology = '{{' + id + '_terminology}}';
        }
      }
      obj = obj[name];
    });
  });

  return fieldObj;

};
