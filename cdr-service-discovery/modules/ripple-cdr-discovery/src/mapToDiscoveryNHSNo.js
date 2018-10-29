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

  16 October 2018

*/

var nhsNumbers = [
  5558526785,
  8111144490,
  8111133448,
  8111162618,
  8111149212,
  8111137710,
  8111160534,
  8111119593,
  8111158424,
  8111123469,
  8111161751,
  8111146787,
  8111158750,
  8111143494,
  5900049116
];

module.exports = function(patientId) {

  //this.db.use('DiscoveryNHSNoMap').delete();
  //return 5558526785;

  var nhsNoMap = this.db.use('DiscoveryNHSNoMap');
  var map_by_helm = nhsNoMap.$(['by_helm', patientId]);
  var map_by_discovery = nhsNoMap.$('by_discovery');

  //nhsNoMap.$(['by_helm', 9999999011]).delete();
  //map_by_discovery.$(8111144490).delete();

  // if the Helm NHS No isn't mapped yet to a Discovery one, do so now

  if (!map_by_helm.exists) {
    for (var i = 0; i < nhsNumbers.length; i++) {
      if (!map_by_discovery.$(nhsNumbers[i]).exists) {
        map_by_helm.value = nhsNumbers[i];
        map_by_discovery.$(nhsNumbers[i]).value = patientId;
        break;
      }
    }
  }

  console.log('** Helm NHS No ' + patientId + ' is mapped to Discovery NHS No ' + map_by_helm.value);

  return map_by_helm.value;
};
