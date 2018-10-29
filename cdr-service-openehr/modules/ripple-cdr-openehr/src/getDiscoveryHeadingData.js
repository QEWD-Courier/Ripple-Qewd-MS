/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
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

  26 October 2018


*/


module.exports = function(patientId, heading, jwt, callback) {

  if (heading === 'finished') {
    console.log('&& getDiscoveryHeadingData finished');
    return callback({
      message: {
        status: 'complete',
        results: []
      }
    });
  }

  var msg2Discovery = {
    path: '/api/discovery/' + patientId + '/' + heading,
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + jwt
    }
  };

  console.log('sending MicroService request: ' + JSON.stringify(msg2Discovery, null, 2));

  this.microServiceRouter.call(this, msg2Discovery, function(discovery_response) {
    console.log('**** response from Discovery for ' + patientId + ': ' + heading + ':\n' + JSON.stringify(discovery_response, null, 2));
    callback(discovery_response);
  });

};

