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

  28 June 2018

*/

var buildJsonFile = require('./buildJsonFile');

module.exports = function(templateName, metadata, filePath) {

  var schema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    title: templateName,
    description: "Data Entry Schema for OpenEHR Template " + templateName,
    type: "object",
    properties: {}
  };

  var obj;
  var max;
  var count;
  var parent;
  //var notNull = '/(.|\s)*\S(.|\s)*/';

  metadata.forEach(function(field) {
    if (field.path[0] === 'context' || field.path[0] === 'composer') return; // ignore for now
    obj = schema.properties;
    parent = schema;
    var max = field.path.length;
    count = 0;
    field.path.forEach(function(property) {
      count++;
      if (!obj[property]) {
        obj[property] = {};
        if (count !== max) {
          obj[property].type = 'object';
          obj[property].properties = {};
        }
      }
      if (count === max) {

        if (property === 'language' || property === 'encoding' || property === 'subject') {
          delete obj[property];
          return;
        }

        if (field.type === 'DV_TEXT' || field.type === 'DV_CODED_TEXT') {
          obj[property] = {
            anyOf: [
              {type: 'string'},
              {type: 'object'}
            ],
            minLength: 1,
            description: field.name,
            properties: {
              value: {
                description: field.name + ' value',
                type: 'string',
                minLength: 1
              },
              code: {
                description: field.name + ' code',
                type: 'string',
                minLength: 1
              },
              terminology: {
                description: field.name + ' terminology',
                type: 'string',
                minLength: 1
              }
            }
          };
          // remove minLength for value if it's a coded field
          if (field.codes) {
            obj[property].properties.value.minLength = 0;  // make optional
          }

          if (field.required) {
            if (!obj[property].required) obj[property].required = [];
            obj[property].required.push('value');
          }
        }
        else {

          if (field.required) {
            if (!parent.required) parent.required = [];
            parent.required.push(property);
          }

          var type = 'string';
          /*
          obj[property] = {
            description: field.name,
            type: type,
            minLength: 1
          };
          */

          obj[property] = {
            type: 'object',
            properties: {
              value: {
                description: field.name + ' value',
                type: 'string',
                minLength: 1
              }
            }
          };

          if (field.type === 'DV_DATE_TIME') {
            obj[property].properties.value.format = 'date-time';
          }
          if (field.type === 'DV_QUANTITY' || field.type === 'DV_COUNT') {
            obj[property].properties.value.type = 'number';
          }
          if (field.type === 'DV_BOOLEAN') {
            obj[property].properties.value.type = 'boolean';
          }
        }
      }
      else {
        parent = obj[property];
        obj = obj[property].properties;
      }
    });
  });

  console.log('schema: ' + JSON.stringify(schema));

  buildJsonFile(schema, filePath, 'schema.json');
};

