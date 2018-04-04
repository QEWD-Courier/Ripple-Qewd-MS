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

module.exports = {
  fhirReference: function(input, prefix, inverse) {
    if (!inverse) return prefix + '/' + input;
    return input.split(prefix + '/')[1];
  },
  rippleDateTime: function(input, inverse) {
    if (inverse) {
      if (!input || input === '') return '';
      if (input.indexOf('UTC') !== -1) input = input.split('UTC')[0];
      return new Date(input).getTime();
    }
    if (!input) return new Date().toISOString();
    return new Date(input).toISOString();
  },
  getUid: function(uid, host) {
    return host + '-' + uid.split('::')[0];
  },
  fhirSnomed: function(input, inverse) {
    if (input === '') return '<!delete>';
    if (!inverse) {
      if (input === 'SNOMED-CT') return 'http://snomed.info/sct';
      return input;
    }
    if (input === 'http://snomed.info/sct') return 'SNOMED-CT';
    return input;
  },
  dvText: function(inputObj) {
    if (typeof inputObj.value !== 'undefined' && inputObj.value !== '') {
      if (typeof inputObj.code === 'undefined' || inputObj.code === '') {
        return '<!delete>';
      }
      if (typeof inputObj.terminology === 'undefined' || inputObj.terminology === '') {
        return '<!delete>';
      }
      var result = inputObj.value.toString();
      delete inputObj.value;  // so that next Flat JSON directive doesn't create |value reference
      return result;
    }
    else {
      return '<!delete>';
    }
  }
};