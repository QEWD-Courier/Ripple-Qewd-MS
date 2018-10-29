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

var request = require('request');
var api_server = require('./hosts').api;
var getPatientBundle = require('./getPatientBundle');
var cacheHeadingResources = require('./cacheHeadingResources');

module.exports = function(nhsNumber, resourceRequired, token, session, callback) {

  if (session.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceRequired]).exists) {
    callback(false);
  }
  else {
    var patientBundle = getPatientBundle(nhsNumber, session);
    var uri = api_server.host + api_server.paths.getPatientResources;
    var body = {
      resources: [resourceRequired],
      patients: patientBundle
    };

    var params = {
      url: uri,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(body)
    };
    console.log('getResource params = ' + JSON.stringify(params, null, 2));
    request(params, function(error, response, body) {
      console.log('Patient Resources response: ' + JSON.stringify(response, null, 2));
      if (!error) {
        var resources = JSON.parse(body);

        console.log('\n ***** resources = ' + JSON.stringify(resources, null, 2));
        // process and cache the patient resource payload

        if (!resources.entry) {
          return callback(false);
        } 

        cacheHeadingResources(resources.entry, resourceRequired, token, session, function(error) {
          if (error) {
            return callback(error);
          }
          callback(false);
        });
      }
      else {
        console.log(error);
        callback(error);
      }
    });
  }
};
