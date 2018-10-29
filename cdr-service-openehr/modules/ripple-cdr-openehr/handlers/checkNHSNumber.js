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

var tools = require('../src/tools');
var checkNHSNumber = require('../src/checkNHSNumber');

module.exports = function(args, finished) {

  /*
       invoked by:   /api/openehr/check
  */

  var patientId = args.session.nhsNumber;
  var email = args.session.email;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var session = args.req.qewdSession;

  var recordStatusDoc = session.data.$('record_status');

  // the following will apply to subsequent attempts to call /api/openehr/check

  if (recordStatusDoc.exists) {
    var requestNo = recordStatusDoc.$('requestNo').increment();
    var recordStatus = recordStatusDoc.getDocument();
    if (recordStatus.status === 'loading_data') {
      return finished({
        status: 'loading_data',
        new_patient: recordStatus.new_patient,
        responseNo: requestNo,
        nhsNumber: patientId
      });
    }
    else {
      return finished({
        status: 'ready',
        nhsNumber: patientId
      });
    }
  }

  // first time this API has been called in this user session

  recordStatusDoc.setDocument({
    status: 'loading_data',
    new_patient: 'not_known_yet',
    requestNo: 1
  });

  checkNHSNumber.call(this, patientId, email, session, function(response) {

    // see index.js for workerResponseHandler that is invoked when this has completed
    //  where it will next fetch any new heading data from Discovery and
    //  write it into EtherCIS record

    console.log('** response from /src/checkNHSNumber: \n' + JSON.stringify(response, null, 2));

    recordStatusDoc.$('new_patient').value = response.new_patient;
    recordStatusDoc.$('status').value = 'loading_data';

    finished({
      status: 'loading_data',
      new_patient: response.new_patient,
      responseNo: recordStatusDoc.$('responseNo').value,
      nhsNumber: patientId
    });

  });

};


