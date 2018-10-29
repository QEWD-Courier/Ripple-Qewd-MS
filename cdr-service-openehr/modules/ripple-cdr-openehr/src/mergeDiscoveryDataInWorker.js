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

  25 October 2018


*/


module.exports = function(patientId, heading, jwt, discovery_data, callback) {

  /*

    This is invoked from the workerResponseHander in index.js

    As a result, we're currently in the master process

    So we manually dispatch a request for the /discovery/merge/:heading API to
    a worker process, simulating as if it had come in from an external client
    and via the Conductor microservice

    Note: the worker will invoke /handlers/mergeDiscoveryData.js to deal with this

  */

  var messageObj = {
    application: 'ripple-cdr-openehr',
    type: 'restRequest',
    path: '/discovery/merge/' + heading,
    pathTemplate: '/discovery/merge/:heading',
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + jwt
    },
    args: {
      heading: heading
    },
    data: discovery_data,
    token: this.jwt.handlers.getProperty('uid', jwt)
  };
  this.handleMessage(messageObj, function(responseObj) {
    // heading has been merged into EtherCIS
    callback(responseObj);
  });

};

