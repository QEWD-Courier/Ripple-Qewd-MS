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

module.exports = function(jumperPath) {

  var text = [
    "module.exports = {",
    "  fhirReference: function(input, prefix, inverse) {",
    "    if (!inverse) return prefix + '/' + input;",
    "    return input.split(prefix + '/')[1];",
    "  },",
    "  rippleDateTime: function(input, inverse) {",
    "    if (inverse) {",
    "      if (!input || input === '') return '';",
    "      return new Date(input).getTime();",
    "    }",
    "    if (!input) return new Date().toISOString();",
    "    return new Date(input).toISOString();",
    "  },",
    "  fhirSnomed: function(input, inverse) {",
    "    if (input === '') return '<!delete>';",
    "    if (!inverse) {",
    "      if (input === 'SNOMED-CT') return 'http://snomed.info/sct';",
    "      return input;",
    "    }",
    "    if (input === 'http://snomed.info/sct') return 'SNOMED-CT';",
    "    return input;",
    "  }",
    "};"
  ];

  buildFile(text, jumperPath, 'helpers.js');
};
