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

  16 January 2018

*/

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isGuid(str) {
  var regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexGuid.test(str);
}

function isPatientIdValid(patientId) {

  if (!patientId || patientId === '') {
    return {error: 'patientId ' + patientId + ' must be defined'};
  }

  if (!isNumeric(patientId)) {
    return {error: 'patientId ' + patientId + ' is invalid'};
  }

  return {ok: true};
}

function isHeadingValid(heading) {
  if (!heading || heading === '') return false;
  return this.userDefined.headings[heading];
}

function isSourceIdValid(sourceId) {
  if (!sourceId || sourceId === '') return false;
  var pieces = sourceId.split('-');
  if (pieces.length !== 6) return false;
  pieces.shift(); // remove host name element
  var guid = pieces.join('-');
  if (!isGuid(guid)) return false;
  return true;
}

function isEmpty(obj) {
  if (!obj) return true;
  if (typeof obj !== 'object') return true;
  for (var name in obj) {
    return false;
  }
  return true;
}

module.exports = {
  isNumeric,
  isPatientIdValid,
  isHeadingValid,
  isSourceIdValid,
  isEmpty
};



