/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-18 Ripple Foundation Community Interest Company       |
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

  2 August 2018

*/

module.exports = function(nhsNumber, session) {

  var cachedPatientBundle = session.data.$(['Discovery', 'PatientBundle']);
  var cachedPatient;

  if (cachedPatientBundle.exists) {
    cachedPatient = cachedPatientBundle;
  }
  else {
    cachedPatient = session.data.$(['Discovery', 'Patient']);
  }

  var bundle = {
    resourceType: 'Bundle',
    entry: []
  }
  cachedPatient.$(['by_nhsNumber', nhsNumber, 'Patient']).forEachChild(function(uuid) {
    console.log('uuid: ' + uuid);
    var resource = cachedPatient.$(['by_uuid', uuid, 'data']).getDocument(true);
    bundle.entry.push({
      resource: resource
    });
  });
  return bundle;
};
