/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  15 January 2018

*/

var dateTime = require('./dateTime');
var headings = {};

function helpers(host, heading, method) {

  var helpers = {
    now: function() {
      return dateTime.now();
    },
    getRippleTime: function(date) {
      //console.log('rippleTime: date = ' + date + '; host = ' + host);
      return dateTime.getRippleTime(date, host);
    },
    msAtMidnight: function(date) {
      return dateTime.msAtMidnight(date, host, true);
    },
    msSinceMidnight: function(date) {
      var d = new Date(date).getTime() - 3600000;
      return dateTime.msSinceMidnight(d, host, true);
    },
    msAfterMidnight: function(date) {
      var d = new Date(date).getTime();
      return dateTime.msSinceMidnight(d, host);
    },
    getSource: function() {
      return host;
    },
    getCountsSource: function() {
      return host + '-counts';
    },
    getUid: function(uid) {
      return uid.split('::')[0];
    },
    integer: function(value) {
      return parseInt(value);
    }
  };

  // augment with heading-specific helper methods

  if (!headings[heading]) {
    headings[heading] = require('../headings/' + heading);
  }
  method = method || 'get';

  if (headings[heading][method] && headings[heading][method].helperFunctions) {
    var helperFunctions = headings[heading][method].helperFunctions;
    for (var name in helperFunctions) {
      helpers[name] = helperFunctions[name];
    }
  }
  return helpers;
}

module.exports = helpers;
