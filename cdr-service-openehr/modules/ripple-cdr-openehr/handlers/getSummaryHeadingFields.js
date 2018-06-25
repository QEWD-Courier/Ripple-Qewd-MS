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

  21 June 2018

*/

var tools = require('../src/tools');
var headingDefinitions = {};

module.exports = function(args, finished) {

  if (args.session.userMode !== 'admin') {
    return finished({error: 'Invalid request'});
  }

  var heading = args.heading;
  if (heading && (heading === 'feeds' || heading === 'top3Things')) {
    return finished({error: heading + ' records are not maintained on OpenEHR'});
  }

  var headingInfo = tools.isHeadingValid.call(this, heading);

  if (!headingInfo) {
    return finished({error: 'Invalid or missing heading: ' + heading});
  }

  if (headingInfo === true) {
    if (!headingDefinitions[heading]) {
      headingDefinitions[heading] = require('../headings/' + heading);
    }
    headingInfo = {
      summaryTableFields: headingDefinitions[heading].headingTableFields
    };
  }
  console.log('** headingInfo: ' + JSON.stringify(headingInfo, null, 2));
  finished(headingInfo.summaryTableFields);

};
