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

  19 October 2018

*/

var deletePatientHeading = require('./deletePatientHeading');
var tools = require('../src/tools');

module.exports = function(args, finished) {

  var patientId = args.patientId;
  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;
  if (!tools.isHeadingValid.call(this, heading)) {
    console.log('*** ' + heading + ' is invalid or has not yet been added to middle-tier processing');
    return finished([]);
  }

  console.log('\n*** Reverting Discovery Data for ' + patientId + ' & ' + heading + '***\n');

  var discovery_map = this.db.use('DiscoveryMap');
  var discovery_sourceId_index = discovery_map.$('by_discovery_sourceId');
  var openehr_sourceId_index = discovery_map.$('by_openehr_sourceId');

  var noOfRecords = 0;
  var sourceIdArr = [];
  openehr_sourceId_index.forEachChild(function(sourceId, node) {
    if (node.$('heading').value === heading && node.$('patientId').value.toString() === patientId.toString()) {
      noOfRecords++;
      sourceIdArr.push(sourceId);
    }
  });

  var count = 0;
  var _this = this;
  var results = [];
  args.session.userMode = 'admin';  // override for now
  console.log('noOfRecords = ' + noOfRecords);

  function deleteNextSourceId(recNo) {
    recNo++;
    if (recNo === noOfRecords) return true;  // finished
    var sourceId = sourceIdArr[recNo];
    console.log('sourceId = ' + sourceId);
    var node = openehr_sourceId_index.$(sourceId);
    var index = node.getDocument();
    args.sourceId = sourceId;
    console.log('*** deleting ' + sourceId);

    discovery_sourceId = index.discovery;

    deletePatientHeading.call(_this, args, function(response) {
      console.log('** response from EtherCIS = ' + JSON.stringify(response));
      if (!response.error) {
        node.delete();
        discovery_sourceId_index.$(discovery_sourceId).delete();
      }
      results.push(response);
      var complete = deleteNextSourceId(recNo);
      if (complete) {
        finished(results);
      }
    });
    
    /*

    // let's just simulate it first

    setTimeout(function() {
      console.log('Simulated the deletion of ' + sourceId);
      results.push({sourceId: sourceId});
      console.log('recNo was ' + recNo + '; now delete the next one');
      var complete = deleteNextSourceId(recNo);
      console.log('complete: ' + complete);
      if (complete) {
        console.log('*** finished!');
        finished(results);
      }
    }, 200);

    */
  }

  var complete = deleteNextSourceId(-1);  // kick it off
  if (complete) {
    // there were no matching records
    finished(results);
  }

};

