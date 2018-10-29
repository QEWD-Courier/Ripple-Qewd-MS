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

  3 August 2018

*/

var getResource = require('./getResource');

module.exports = function(practitionerResource, resourceName, token, session, callback) {

  var roles = practitionerResource.practitionerRole;
  var max = roles.length;
  var count = 0;
  roles.forEach(function(role) {
    var organisationRef = role.managingOrganization.reference;

    getResource(organisationRef, token, session, function(error, resource) {
      if (error) {
        return callback(error);
      }
      else {

        if (resourceName === 'Patient' && resource) {
          if (resource.extension) {
            var found = false;
            resource.extension.forEach(function(record) {
              if (record.valueReference) {
                found = true;
                var locationRef = record.valueReference.reference;
                getResource(locationRef, token, session, function(error, resource) {
                  count++;
                  if (count === max) callback();
                });
              }
            });
            if (!found) {
              count++;
              if (count === max) callback();
            }
          }
          else {
            count++;
            if (count === max) callback();
          }
        }
        else {
          count++;
          if (count === max) callback();
        }
      }
    });
  });
};
