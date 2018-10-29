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

  10 October 2018

*/

module.exports = function(patientId, heading, host) {

  // delete cached heading data in all active sessions, for patient

  var sessions = this.sessions.active();
  sessions.forEach(function(session) {
    var patientHeadingCache = session.data.$(['headings', 'byPatientId', patientId, heading]);
    if (patientHeadingCache.exists) {
      var byDateCache = patientHeadingCache.$('byDate');
      var sourceIdCache = session.data.$(['headings', 'bySourceId']);
      patientHeadingCache.$(['byHost', host]).forEachChild(function(sourceId, indexNode) {
        var sourceIdNode = sourceIdCache.$(sourceId);
        var date = sourceIdNode.$('date').value;
        sourceIdNode.delete();
        byDateCache.$([date, sourceId]).delete();
        indexNode.delete();
      });
    }
    session.data.$(['headings', 'byHeading', heading]).delete();
  });
};
