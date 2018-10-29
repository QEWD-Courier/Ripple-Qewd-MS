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

  11 October 2018

*/

var request = require('request');
var api_server = require('./hosts').api;
var cachePatientResource = require('./cachePatientResource');

module.exports = function(nhsNumber, token, session, callback) {

  if (session.data.$(['Discovery', 'Patient','by_nhsNumber', nhsNumber]).exists) {
    callback(false);
  }
  else {
    var uri = api_server.host + api_server.paths.getPatientsByNHSNumber;
    var params = {
      url: uri,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token
      },
      qs: {
        nhsNumber: nhsNumber
      }
    };
    console.log('getPatientByNHSNumber params = ' + JSON.stringify(params, null, 2));
    request(params, function(error, response, body) {
      console.log('*** getPatientByNHSNumber response: ' + JSON.stringify(response, null, 2));
      if (response.statusCode !== 200) {
        return callback({error: 'Discovery Server Problem: ' + body});
      }
      if (!error) {
        try {
          var patientResource = JSON.parse(body);
          cachePatientResource(nhsNumber, patientResource, session);
          callback(false);
        }
        catch(err) {
          console.log('** unable to parse body: ' + body);
          callback({error: err});
        }
      }
      else {
        console.log(error);
        callback(error);
      }
    });
  }
};
