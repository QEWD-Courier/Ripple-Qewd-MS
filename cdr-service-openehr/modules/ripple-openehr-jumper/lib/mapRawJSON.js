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

  11 April 2018

*/

var traverse = require('traverse');

module.exports = function(params) {

  var rawjson = params.data;
  var templateId = params.templateId;
  var documentName = params.documentName;
  var host = params.host;
  var patientId = params.patientId;

  var templateDoc = this.db.use(documentName, 'templateMap', templateId);
  var templateIndex = templateDoc.$('index');
  var templateFields = templateDoc.$('field');

  var results = [];

  rawjson.resultSet.forEach(function(record, index) {

    //console.log('** index = ' + index);
    //console.log('** record = ' + JSON.stringify(record));

    var start_time = '';
    var hc_facility = {};
    var context = record.data.context;
    if (context) {
      if  (context.start_time && context.start_time.value) {
        start_time = context.start_time.value;
        if (start_time.indexOf('UTC') !== -1) start_time = start_time.split('UTC')[0];
      }
      var hcf = context.health_care_facility;
      if  (hcf) {
        if (hcf.name) hc_facility.name = hcf.name;
        var extref = hcf.external_ref;
        if (extref) {
          if (extref.id) {
            hc_facility.id = {};
            if (extref.id.value) hc_facility.id.value = extref.id.value;
            if (extref.id.scheme) hc_facility.id.scheme = extref.id.scheme;
          }
          if (extref.namespace) hc_facility.id.namespace = extref.namespace;
        }
      }
    }

    var result = {
      uid: record.data.uid.value,
      composer: {
        value: record.data.composer.name
      },
      start_time: start_time,
      health_care_facility: hc_facility,
      patientId: patientId,
      host: host
    };

    traverse(record.data.content[0]).map(function(node) {
      if (node['@class']) {
        if (node['@class'] === 'ELEMENT' && node.name && node.name.value) {

          var parent = this.parent;
          var path = '';
          do {
            //console.log('*** parent.key = ' + parent.key);
            if (Number.isInteger(parseInt(parent.key))) {
              piece = parent.node.archetype_node_id;
              path = '[' + piece + ']/' + path;
            }
            else {
              piece = parent.key;
              if (typeof piece === 'undefined') piece = '/content';
              if (parent.node.archetype_node_id) piece = piece + '[' + parent.node.archetype_node_id + ']';
              if (path !== '' && path[0] !== '[') path = '/' + path;
              path = piece + path;
            }
            //console.log('*** path - ' + path);
            parent = parent.parent;
          }
          while (parent);
          if (node.archetype_node_id) {
            piece = node.archetype_node_id;
            path = path + '[' + piece + ']';
          }
          var aqlArr = path.split('/');
          aqlArr.shift();

          aqlArr.push(node.name.value);
          //console.log('aqlArr = ' + JSON.stringify(aqlArr));
          var index = templateIndex.$(aqlArr);

          if (index.exists) {
            //console.log('** index exists in global');
            var fieldId = index.value;
            //console.log('fieldId = ' + fieldId);
            var fieldDoc = templateFields.$(fieldId);
            var fieldArr = fieldDoc.$('path').getDocument(true);
            //console.log('fieldArr = ' + JSON.stringify(fieldArr));
            var obj = result;
            var max = fieldArr.length - 1;
            fieldArr.forEach(function(name, index) {
              //console.log('name = ' + name);
              if (typeof obj[name] === 'undefined') obj[name] = {};
              if (index === max) {
                obj[name] = {
                  value: node.value.value
                };
                if (node.value.defining_code) {
                  if (node.value.defining_code.code_string) {
                    obj[name].code = node.value.defining_code.code_string;
                  }
                  else if (node.value.defining_code.codeString) {
                    obj[name].code = node.value.defining_code.codeString;
                  }
                  if (node.value.defining_code.terminology_id) obj[name].terminology = node.value.defining_code.terminology_id.value;
                }
              }
              //console.log('name = ' + name + '; obj[name] = ' + JSON.stringify(obj[name], null, 2));
              obj = obj[name];
            });
          
          }       
        }
      }
    });
    //console.log('&&& loop ' + index);
    //console.log('result = ' + JSON.stringify(result));
    results.push(result);
  })
  return results;
};

