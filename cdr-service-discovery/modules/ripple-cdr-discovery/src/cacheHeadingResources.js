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

var cacheResource = require('./cacheResource');
var getResource = require('./getResource');
var getPractitionerOrganisations = require('./getPractitionerOrganisations');

function isEmpty(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

module.exports = function(dataArray, resourceName, token, session, callback) {

  var max = dataArray.length;
  var count = 0;

  //var fetching = {};
  session.data.$('fetchingResource').delete();

  var cachedPatientsNode = session.data.$(['Discovery', 'Patient']);
  var cachedResourceNode = session.data.$(['Discovery', resourceName, 'by_uuid']);

  if (resourceName === 'Patient') {

    session.data.$(['Discovery', 'PatientBundle']).setDocument(cachedPatientsNode.getDocument(true));

    cachedResourceNode.delete();  // we want to overwrite the patient cached records with full ones
  }

  dataArray.forEach(function(entry) {
    var resource = entry.resource;
    if (resource.resourceType === resourceName) {

      cacheResource(resourceName, resource, session);

      var patientUuid;
      if (resourceName === 'Patient') {
        patientUuid = resource.id;
      }
      else {
        patientUuid = resource.patient.reference.split('/')[1];
      }
      var cachedPatientNode = cachedPatientsNode.$(['by_uuid', patientUuid]);
      var nhsNumber = cachedPatientNode.$('nhsNumber').value;
      var resource_uuid = resource.id;
      cachedPatientNode.$(['resources', resourceName, resource_uuid]).value = resource_uuid;
      cachedPatientsNode.$(['by_nhsNumber', nhsNumber, 'resources', resourceName, resource_uuid]).value = resource_uuid;

      var practitionerRef;
      if (resource.informationSource) practitionerRef = resource.informationSource.reference;
      if (resource.recorder) practitionerRef = resource.recorder.reference;
      if (resource.asserter) practitionerRef = resource.asserter.reference;
      if (resource.careProvider) {
        var found = false;
        resource.careProvider.forEach(function(record) {
          if (!found && record.reference.indexOf('Practitioner') !== -1) {
            practitionerRef = record.reference;
            found = true;
          }
        });
      }
      if (resource.performer) practitionerRef = resource.performer.reference;
      if (!practitionerRef) {
        console.log('*** bad resource: ' + JSON.stringify(resource, null, 2));
        count++;
        if (count === max) callback();
        return;
      }

      var practitionerUuid = practitionerRef.split('/')[1];
      cachedResourceNode.$([resource_uuid, 'practitioner']).value = practitionerUuid;

      getResource(practitionerRef, token, session, function(error, resource) {
        if (error) {
          return callback(error);
        }
        else {
          if (isEmpty(resource)) {
            count++;
            if (count === max) callback();
            return;
          }

          // resource will be null if either:
          //    - the practitioner is already cached; or
          //    - the practioner is already in the process of being fetched in an earlier iteration
          if (resource) {
            // ensure Organisation records for Practioner are also fetched and cached
            getPractitionerOrganisations(resource, resourceName, token, session, function(error) {
              if (error) {
                return callback(error);
              }
              count++;
              if (count === max) callback();
            });
          }
          else {
            count++;
            if (count === max) callback();
          }
        }
      });
    }
    else {
      count++;
      if (count === max) callback();
    }
  });
};

