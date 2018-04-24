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

  16 April 2018

*/

var transform = require('qewd-transform-json').transform;
var fs = require('fs-extra');
var helpers = require('./helpers');
var sendHeadingToOpenEHR = require('./sendHeadingToOpenEHR');
var Validator = require('jsonschema').Validator;
var validator = new Validator();

var initialised = false;
var templateIndex = {};
var servers;
var jumperModules = {};

function initialise() {
  if (initialised) return;
 
  var templateName;
  var headingObj;
  var postTemplate;

  // create index of templates / headings that are ready for Jumper processing

  for (var heading in this.userDefined.headings) {
    headingObj = this.userDefined.headings[heading];
    if (typeof headingObj === 'object' && headingObj.template && headingObj.template.name) {
      postTemplate = this.userDefined.paths.jumper_templates + heading + '/flatJSON_template.json';
      if (fs.existsSync(postTemplate)) {
        templateIndex[headingObj.template.name] = heading;
      }
    }
  }
  servers = this.userDefined.openehr;
  initialised = true;
}

module.exports = function(params, callback) {

  // called by ripple-cdr-openehr/postHeading
  //  saving data using Jumper instead

  var heading = params.heading;
  var data = params.data;

  initialise.call(this);

  data.patientId = params.patientId;
  data.source = params.defaultHost;

  if (!jumperModules[heading]) {
    jumperModules[heading] = {
      path: this.userDefined.paths.jumper_templates + heading
    }
  }
  var headingPath = jumperModules[heading].path;
  if (!jumperModules[heading].pulsetile_to_openehr) {
    jumperModules[heading].pulsetile_to_openehr = require(headingPath + '/PulseTile_to_OpenEHR.json');
  }
  var template = jumperModules[heading].pulsetile_to_openehr;
  var openEHRFormatData = transform(template, data, helpers);
  console.log('openEHRFormatData = ' + JSON.stringify(openEHRFormatData, null, 2));

  // validate against JSON schema

  if (!jumperModules[heading].schema) {
    jumperModules[heading].schema = require(headingPath + '/schema.json');
  }

  var schema = jumperModules[heading].schema;

  // perform the schema validation here

  var results = validator.validate(openEHRFormatData, schema);

  // if any errors, finish

  console.log('validation results: ' + JSON.stringify(results));

  if (results.errors && results.errors.length > 0) {
    var errors = '';
    var semicolon = '';
    results.errors.forEach(function(error) {
      errors = errors + semicolon + error.property + ': ' + error.message;
      semicolon = ';'; 
    });
    return callback({error: errors});
  }

  if (!jumperModules[heading].flat_json) {
    jumperModules[heading].flat_json = require(headingPath + '/flatJSON_template.json');
  }
  template = jumperModules[heading].flat_json;

  var flatJSON = transform(template, openEHRFormatData, helpers);
  console.log('Flat JSON for ' + heading + ': ' + JSON.stringify(flatJSON, null, 2));

  params.flatJSON = flatJSON;
    
  sendHeadingToOpenEHR.call(this, params, callback);

};
