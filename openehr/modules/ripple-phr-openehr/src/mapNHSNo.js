/*

 ----------------------------------------------------------------------------
 | ripple-phr-openehr: Ripple MicroServices for OpenEHR                     |
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

  15 January 2018

*/

var openEHR = require('./openEHR');

function isCached(nhsNoMap) {

  var servers = this.userDefined.openehr;
  for (var host in servers) {
    if (!nhsNoMap.$(host).exists) return false;
  }
  return true;
}

function mapNHSNo(nhsNo, sessions, callback) {

  var nhsNoMap = this.db.use('RippleNHSNoMap', ['byNHSNo', nhsNo]);

  // check that all mapped values exist - otherwise rebuild

  if (isCached.call(this, nhsNoMap)) {
    if (callback) callback();
    return;
  }

  var mapByEhrId = this.db.use('RippleNHSNoMap', ['byEhrId']);

  var params = {
    callback: callback,
    url: '/rest/v1/ehr',
    queryString: {
      subjectId: nhsNo,
      subjectNamespace: 'uk.nhs.nhs_number'
    },
    method: 'GET',
    sessions: sessions
  };
  params.processBody = function(body, host) {
    if (body && body.ehrId) {
      nhsNoMap.$(host).value = body.ehrId;
      mapByEhrId.$([body.ehrId, host]).value = nhsNo;
    }
  };
  openEHR.requests(params);
}

module.exports = mapNHSNo;
