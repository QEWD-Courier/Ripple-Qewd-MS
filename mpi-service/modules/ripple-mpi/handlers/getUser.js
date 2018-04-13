/*

 ----------------------------------------------------------------------------
 | ripple-mpi: Ripple Master Patient Index / PAS MicroService               |
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

  12 March 2018

*/

module.exports = function(args, finished) {

  var jwt = args.session;
  var nhsNumber = jwt.nhsNumber;
  var role = jwt.role;

  console.log('args: ' + JSON.stringify(args));

  var patientsDoc = this.db.use('RipplePHRPatients', 'byId');
  var patientList = args.req.qewdSession.data.$('patientList');

  if (!nhsNumber && role === 'IDCR') {

    // create this user's patient list in QEWD session
    //  for now it will be all patients in the database
    //  but in time will be just those the user has access to


    patientsDoc.forEachChild(function(id) {
      patientList.$(id).value = id;
    });

    return finished({
      given_name: jwt.given_name,
      family_name: jwt.family_name,
      email: jwt.email,
      tenant: '',
      role: role,
      roles: [role]
    });
  }

  var patient = patientsDoc.$(nhsNumber);
  if (!patient.exists) return finished({error: 'No such NHS Number: ' + nhsNumber});

  var sub;
  var givenName;
  var familyName;
  var email;

  if (jwt.openid) {
    sub = jwt.openid.sub;
    var pieces = patient.$('name').value.split(' ');
    givenName = pieces[0];
    familyName = pieces[pieces.length - 1];
    email = '';
  }

  if (jwt.auth0) {
    var auth0 = jwt.auth0;
    sub = auth0.sub;
    givenName = auth0.given_name;
    familyName = auth0.family_name;
    email = auth0.email;
  }

  var role = 'IDCR';
  if (jwt.role === 'phrUser') role = 'PHR';

  if (role === 'IDCR') {
    if (!patientList.$(nhsNumber).exists) {
      return finished({error: 'You have no access to this patient'});
    }
  }

  finished({
    sub: sub,
    given_name: givenName,
    family_name: familyName,
    email: email,
    tenant: '',
    role: role,
    roles: [role],
    nhsNumber: nhsNumber
  });
};
