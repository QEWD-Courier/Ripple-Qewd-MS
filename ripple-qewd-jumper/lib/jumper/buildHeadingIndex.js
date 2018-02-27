/*

 ----------------------------------------------------------------------------
 | qewd: Quick and Easy Web Development                                     |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.=|
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

  3 November 2017

*/

var buildFile = require('./buildFile');

module.exports = function(templateName, fhirResourceName, headingPath) {

  console.log('in buildHeadingIndex: ' + headingPath);

  var text = [
    "var helpers = require('../helpers');",
    "var headingHelpers;",
    "try {",
    "  headingHelpers = require('./helpers');",
    "}",
    "catch(err) {}",
    "if (headingHelpers) {",
    "  for (var fnName in headingHelpers) {",
    "    helpers[fnName] = headingHelpers[fnName];",
    "  }",
    "}",
    "module.exports = {",
    "  names: {",
    "    openEHR: '" + templateName + "',",
    "    fhir: '" + fhirResourceName + "'",
    "  },",
    "  transform: {",
    "    openEHR: {",
    "      to: {",
    "        ripple: require('./openEHR_to_Ripple.json'),",
    "        fhir: require('./openEHR_to_FHIR.json'),",
    "        flatJSON: require('./flatJSON_template.json')",
    "      }",
    "    },",
    "    ripple: {",
    "      to: {",
    "        openEHR: require('./Ripple_to_OpenEHR.json')",
    "      }",
    "    },",
    "    fhir: {",
    "      to: {",
    "        openEHR: require('./FHIR_to_OpenEHR.json')",
    "      }",
    "    }",
    "  },",
    "  schema: require('./schema.json'),",
    "  helpers: helpers",
    "};"
  ];

  buildFile(text, headingPath, 'index.js');
};
