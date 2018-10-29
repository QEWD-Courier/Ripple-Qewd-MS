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

  11 October 2018

*/

var deletePatientHeading = require('./deletePatientHeading');

module.exports = function(args, finished) {

  console.log('*** Reverting Discovery Data ***');

  var discovery_map = this.db.use('DiscoveryMap');
  var discovery_sourceId_index = discovery_map.$('by_discovery_sourceId');
  var openehr_sourceId_index = discovery_map.$('by_openehr_sourceId');

  var noOfRecords = 0;
  openehr_sourceId_index.forEachChild(function(sourceId) {
    noOfRecords++;
  });

  var count = 0;
  var _this = this;
  var results = [];
  args.session.userMode = 'admin';  // override for now

  openehr_sourceId_index.forEachChild(function(sourceId, node) {
    var index = node.getDocument();
    args.patientId = index.patientId;
    args.heading = index.heading;
    args.sourceId = sourceId;
    console.log('*** deleting ' + sourceId);

    discovery_sourceId = index.discovery;
    node.delete();
    discovery_sourceId_index.$(discovery_sourceId).delete();

    deletePatientHeading.call(_this, args, function(response) {
      results.push(response);
      count++;
      if (count === noOfRecords) {
        finished(results);
      }
    });
  });
};

