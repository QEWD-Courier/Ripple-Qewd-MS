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

  17 October 2018

*/


module.exports = function(patientId, session) {

  console.log('*** in getDemographics with patientId = ' + patientId);

  var discoveryCache = session.data.$('Discovery');
  var patientsCache = discoveryCache.$('Patient');

  var saved = this.db.use('SavedDiscovery');
  if (patientId !== 5558526785) {
    saved.delete();
    saved.setDocument(discoveryCache.getDocument(true));
  }

  var patient_uuid = patientsCache.$(['by_nhsNumber', patientId, 'Patient']).firstChild.value;
  console.log('patient_uuid = ' + patient_uuid);
  var cachedPatient = patientsCache.$(['by_uuid', patient_uuid]);  
  var patient = cachedPatient.$('data').getDocument(true);
  console.log('** patient = ' + JSON.stringify(patient, null, 2));
  
  var practitioner_uuid = cachedPatient.$('practitioner').value;
  console.log('practitioner_uuid = ' + practitioner_uuid);

  var practitioner = discoveryCache.$(['Practitioner', 'by_uuid', practitioner_uuid, 'data']).getDocument(true);

  practitioner.address = 'Not known';
  if (practitioner.practitionerRole) {
    if (practitioner.practitionerRole[0]) {
      if (practitioner.practitionerRole[0].managingOrganization) {
        if (practitioner.practitionerRole[0].managingOrganization.reference) {
          var organisation_ref = practitioner.practitionerRole[0].managingOrganization.reference;
          var organisation_uuid = organisation_ref.split('/')[1];
          var organisation = discoveryCache.$(['Organization', 'by_uuid', organisation_uuid, 'data']).getDocument(true);

          if (organisation.extension) {
            var found = false;
            organisation.extension.forEach(function(record) {
              if (!found) {
                if (record.valueReference && record.valueReference.reference) {
                  found = true;
                  var location_uuid = record.valueReference.reference.split('/')[1];
                  var location = discoveryCache.$(['Location', 'by_uuid', location_uuid, 'data']).getDocument(true);
                  if (location.address && location.address.text) {
                    practitioner.address = location.address.text
                  }
                }
              }
            });
          }

        }
      }
    }
  }

  var gender;
  if (Array.isArray(patient.gender)) {
    gender = patient.gender[0].toUpperCase() + patient.gender.slice(1)
  }
  else {
    gender = patient.gender;
  }

  var name;
  var obj = patient.name[0];
  if (obj) {
    if (obj.text) {
      name = obj.text;
    }
    else {
      name = '';
      if (obj.given) {
        if (Array.isArray(obj.given)) {
          var space = '';
          obj.given.forEach(function(firstName) {
            name = name + space + firstName;
            space = ' ';
          });
        }
        else {
          name = obj.given;
        }
      }
      if (obj.family) {
        if (Array.isArray(obj.family)) {
          var space = ' ';
          obj.family.forEach(function(lastName) {
            name = name + space + lastName;
          });
        }
        else {
          name = name + ' ' + obj.family;
        }
      }
    }
  }

  var address = 'Not known';
  if (patient.address && Array.isArray(patient.address)) {
    var addrObj = patient.address[0];
    if (addrObj.text) {
      address = addrObj.text;
    }
    else {
      if (addrObj.postalCode) {
        address = '';
        var dlim = '';
        if (addrObj.line) {
          if (Array.isArray(addrObj.line)) {
            addrObj.line.forEach(function(line) {
              address = address + dlim + line;
              dlim = ', ';
            });
          }
          else {
            address = address + dlim + addrObj.line;
          }
        }
        if (addrObj.city) address = address + dlim + addrObj.city;
        if (address === '') dlim = '';
        address = address + dlim + addrObj.postalCode;
      }
    }
  }

  var phone = '';
  if (patient.telecom) {
    if (Array.isArray(patient.telecom)) {
      phone = patient.telecom[0].value;
    }
    else {
      phone = patient.telecom;
    }
  }

  var gpName = 'Not known';
  if (practitioner.name) {
    if (practitioner.name.text) {
      gpName = practitioner.name.text;
    }
    else {
      gpName = '';
      if (practitioner.name.given) {
        if (Array.isArray(practitioner.name.given)) {
          var space = '';
          practitioner.name.given.forEach(function(firstName) {
            gpName = gpName + space + firstName;
            space = ' ';
          });
        }
        else {
          gpName = practitioner.name.given;
        }
      }
      if (practitioner.name.family) {
        if (Array.isArray(practitioner.name.family)) {
          space = ' ';
          practitioner.name.family.forEach(function(lastName) {
            gpName = gpName + space + lastName;
          });
        }
        else {
          gpName = gpName + ' ' + practitioner.name.family;
        }
      }
    }
  }

  var demographics = {
    address: address,
    dateOfBirth: new Date(patient.birthDate).getTime(),
    gender: gender,
    gpAddress: practitioner.address || 'Not known',
    gpName: gpName,
    id: patientId,
    name: name,
    nhsNumber: patientId,
    telephone: phone
  }

  discoveryCache.delete();

  return {
    demographics: demographics
  };
};
