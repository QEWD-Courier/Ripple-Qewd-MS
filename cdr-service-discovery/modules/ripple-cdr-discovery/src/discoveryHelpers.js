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

  17 October 2018

*/

module.exports = {
  fhirDateTime: function(d) {
    return new Date(d).toISOString();
  },
  convertToString: function(input) {
    //console.log('**** convertToString helper function');
    //console.log('**** input = ' + input);
    //console.log('**** type = ' + typeof input);
    return input.toString();
  },
  useSnomed: function(arr, property) {
    console.log('*!*!*!* using useSnomed function for ' + property + ' with arr ' + JSON.stringify(arr));
    var obj;
    var value = '';
    for (var i = 0; i < arr.length; i++) {
      obj = arr[i];
      if (obj.system && obj.system.indexOf('snomed') !== -1) {
        if (obj[property]) {
          value = obj[property];
          break;
        }
      }
    }
    console.log('value = ' + value);
    return value.toString();
  },
  getCommentFrom(site, route, explanation, note) {
    var value = '';
    var dlim = '';
    if (site !== '' && site.text) {
      value = value + 'Site: ' + site.text;
      dlim = '; ';
    }
    if (route !== '' && route.text) {
      value = value + dlim + 'Route: ' + route.text;
      dlim = '; ';
    }
    if (explanation !== '' && explanation.reason) {
      value = value + dlim + 'Reason: ';
      dlim = '';
      if (Array.isArray(explanation.reason)) {
        explanation.reason.forEach(function(reason) {
          value = value + dlim + reason.text;
          dlim = '; ';
        });
        dlim = ';';
      }
      else {
        value = value + dlim + explanation.reason;
      }
      dlim = '; ';
    }
    if (note !== '') {
      console.log(note);
      if (Array.isArray(note)) {
        note.forEach(function(instance) {
          value = value + dlim + instance.text;
          dlim = '; ';
        });
        dlim = ';';
      }
      else {
        value = value + dlim + note;
      }
    }
    if (value === '') return 'None';
    return value;
  }
};
  