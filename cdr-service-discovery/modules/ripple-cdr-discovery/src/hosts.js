/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

 5 February 2019

*/

module.exports = {
  auth: {
    //host:       'https://devauth.endeavourhealth.net',
    host:       'https://devauth.discoverydataservice.net',
    path:       '/auth/realms/endeavour/protocol/openid-connect/token',
    username:   'xxxxxxxx',
    password:   'yyyyyyyyyyyyyy',
    client_id:  'eds-data-checker',
    grant_type: 'password'
  },
  api: {
    host: 'https://devgateway.discoverydataservice.net/data-assurance',
    paths: {
      getPatientsByNHSNumber: '/api/fhir/patients',
      getPatientResources:    '/api/fhir/resources',
      getResource:            '/api/fhir/reference'
    }
  }
};
