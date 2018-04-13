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

  4 April 2018

*/

var getHeadingBySourceId = require('./getHeadingBySourceId');

function getHeadingTableFromCache(patientId, heading, session) {

  // The heading records are in the QEWD Session cache
  // Retrieve and transform them

  var cachedHeading = session.data.$(['headings', 'byPatientId', patientId, heading, 'byHost']);
  var results = [];
  var self = this;

  cachedHeading.forEachChild(function(host, hostNode) {
    hostNode.forEachChild(function(sourceId) {
      var summary = getHeadingBySourceId.call(self, sourceId, session, 'summary');
      results.push(summary);
    });
  });
  return results;
}

module.exports = getHeadingTableFromCache;
