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

  17 January 2018

*/

var transform = require('qewd-transform-json').transform;
var flatten = require('./objectToFlatJSON');
var dateTime = require('./dateTime');
var openEHR = require('./openEHR');

module.exports = function(params, callback) {
  var postMap = params.headingPostMap;
  var helpers = postMap.helperFunctions || {};
  helpers.now = dateTime.now;

  var output = transform(postMap.transformTemplate, params.data, helpers);
  var body = flatten(output);

  // ready to post
  var params = {
    host: params.host,
    callback: callback,
    url: '/rest/v1/composition',
    queryString: {
      templateId: postMap.templateId,
      ehrId: params.ehrId,
      format: 'FLAT'
    },
    method: 'POST',
    session: params.openEhrSessionId,
    options: {
      body: body
    }
  };
  console.log('**** about to post data: ' + JSON.stringify(params, null, 2));
  params.processBody = function(body, userObj) {
    // for this to work, have to set userObj properties
    //  simply setting the userObj object itself to body won't work
    userObj.data = body;
  };
  var userObj = {};
  openEHR.request(params, userObj);
};
