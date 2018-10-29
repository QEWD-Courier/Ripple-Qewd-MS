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

var moment = require('moment-timezone');
var timezone = 'Europe/London';

function formatDate(date) {
  if (typeof date !== 'object') date = new Date(date);
  return moment(date).tz(timezone).format();
}

module.exports = {
  getStartDateTime: function(date, time) {
    console.log('getStartDateTime: ' + date + '; ' + time);
    return formatDate(new Date(date + time));
  },
  msAfterMidnight: function(date) {
    var e = new Date(date);
    console.log('\n msAfterMidnight: e.setHours(0,0,0,0) = ' + e.setHours(0,0,0,0) + '; e = ' + e.getTime());
    return e.getTime() - e.setHours(0,0,0,0);
  },
  getNarrative: function(name, route, doseAmount, doseTiming) {
    return name + 'Route: ' + route + '; Dose: ' + doseAmount + '; Timing: ' + doseTiming;
  },
  fromNarrative: function(text) {
    if (text.indexOf(' - ') !== -1) {
      var pieces = text.split(' - ');
      if (!pieces[1]) return '';
      if (!pieces[2]) return pieces[1];
      var dose = pieces[2].split(' ')[0];
      return dose;
      //return pieces[1] + ' - ' + pieces[2];
    }
    var pieces = text.split('; Dose: ');
    if (!pieces[1]) return '';
    var dose = pieces[1].split('; Timing: ')[0];
    return dose;
  },
  toInteger: function(input) {
    return parseInt(input);
  },
  convertToString: function(input) {
    //console.log('**** convertToString helper function');
    //console.log('**** input = ' + input);
    //console.log('**** type = ' + typeof input);
    return input;
  },
  trueOnly: function(input) {
    if (input === true) return true;
    return '<!delete>';
  },
  fhirReference: function(input, prefix, inverse) {
    if (!inverse) return prefix + '/' + input;
    return input.split(prefix + '/')[1];
  },
  useSnomed: function(arr, property) {
    console.log('*!*!*!* using useSnomed function for ' + property + ' with arr ' + JSON.stringify(arr));
    return 'Testing';

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
    return value;
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
    // if value property defined, but neither code nor terminology are defined, then return the
    //  value and make sure it can't be used for the |value Flat JSON field that will follow in the
    //  template

    if (typeof inputObj === 'string') {
      if (inputObj === '') {
        return '<!delete>';
      }
      else {
        return inputObj;
      }
    }
    if (typeof inputObj.value !== 'undefined' && inputObj.value !== '') {
      if ((typeof inputObj.code !== 'undefined' && inputObj.code !== '') || (typeof inputObj.terminology !== 'undefined' && inputObj.terminology !== '')) {
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