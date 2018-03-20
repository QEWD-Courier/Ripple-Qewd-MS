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

  13 March 2018

*/

module.exports = function(args, finished) {

  var jwt = args.session;
  var role = jwt.role;

  if (role !== 'IDCR') {
    return finished({error: 'You do not have access to this API'});
  }

  var body = args.req.body;
  var patientsDoc = this.db.use('RipplePHRPatients');
  var patientsById = patientsDoc.$('byId');
  var patientList = args.req.qewdSession.data.$('patientList');

  var patientId = body.nhsNumber;
  if (patientId && patientId !== '') {
    if (!patientsById.$(patientId).exists) {
      return finished({error: 'Invalid NHS Number'});
    }
    if (!patientList.$(patientId).exists) {
      return finished({error: 'You do not have access to this NHS Number'});
    }
    return finished([patientsById.$(patientId).getDocument()]);
  }

  var surname = body.surname;
  if (!surname || surname === '') {
    return finished({error: 'Missing or invalid surname'});
  }
  var forename = body.forename;
  if (!forename || forename === '') {
    return finished({error: 'Missing or invalid forename'});
  }

  surname = surname.toString().trim().toLowerCase();
  forename = forename.toString().trim().toLowerCase();

  var matches = [];
  patientList.forEachChild(function(id) {
    var match = false;
    var patient = patientsById.$(id);
    var patientName = patient.$('name').value.toLowerCase();
    var pieces = patientName.split(' ');
    var fname = pieces[0];
    var sname = pieces[1];
    if (sname === surname && fname.startsWith(forename)) {
      match = true;
      var dob = body.dateOfBirth;
      if (dob && dob !== '') {
        match = false;
        dob = new Date(dob);
        var patDob = new Date(patient.$('dateOfBirth').value);
        if (patDob.toDateString() === dob.toDateString()) match = true;
      }
      else if (body.minValue && body.maxValue) {
        match = false;
        var now = new Date();
        var nowYear = now.getFullYear();
        var fromYear = nowYear - body.maxValue;
        var rootDate = '-' + (now.getMonth() + 1) + '-' + now.getDate();
        var from = fromYear + rootDate;
        var toYear = nowYear - body.minValue;
        var to = toYear + rootDate;
        from = new Date(from).getTime();
        to = new Date(to).getTime();
        var patDob = patient.$('dateOfBirth').value;
        if (patDob >= from && patDob <= to) match = true;
      }

      if (match && (body.sexFemale || body.sexMale)) {
        // if both checked, then ignore gender)
        if (!(body.sexFemale && body.sexMale)) {
          match = false;
          var gender = 'male';
          if (body.sexFemale) gender = 'female';
          if (patient.$('gender').value.toLowerCase() === gender) match = true;
        }
      }

    }
    if (match) matches.push(patient.getDocument());
  });


  finished(matches);

};
