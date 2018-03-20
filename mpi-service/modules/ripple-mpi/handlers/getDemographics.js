/*

 ----------------------------------------------------------------------------
 | ripple-phr-hospital: Ripple MicroServices for Hospital System Access     |
 |                          eg PAS, etc                                     |
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

  12 March 2018

*/

module.exports = function(args, finished) {
  var jwt = args.session;
  var nhsNumber = jwt.nhsNumber;
  var role = jwt.role;

  if (!nhsNumber && role === 'IDCR') {
    nhsNumber = args.patientId;
    if (!args.req.qewdSession.data.$(['patientList', nhsNumber]).exists) {
      return finished({error: 'You have no access to this patient'});
    }
  }
  if (!nhsNumber || nhsNumber === '') {
    return finished({error: 'Patient Id was not specified'});
  }

  var patient = this.db.use('RipplePHRPatients', 'byId', nhsNumber);
  if (!patient.exists) {
    return finished({error: 'No patient exists with that ID'});
  }

  var demographics = patient.getDocument();

  finished({
    demographics: demographics
  });
};
