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

  11 January 2018

*/

var headings = require('../headings/headings').headings;

function getHeadingDetailFromCache(patientId, heading, sourceId, session) {

  var cachedPatient = session.data.$(['patients', patientId]);
  var cachedHeadingIndex = cachedPatient.$(['headingIndex', headings[heading].name, sourceId]);

  if (!cachedHeadingIndex.exists) return {};
  var index = cachedHeadingIndex.getDocument();
  var cachedHeading = cachedPatient.$(['headings', headings[heading].name, index.host, index.recNo]);
  return cachedHeading.getDocument(true);
}

module.exports = getHeadingDetailFromCache;
