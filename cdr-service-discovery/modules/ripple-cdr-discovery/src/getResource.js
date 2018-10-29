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

  17 October 2018

*/

var request = require('request');
var api_server = require('./hosts').api;
var cacheResource = require('./cacheResource');

module.exports = function(reference, token, session, callback) {

  var pieces = reference.split('/');
  var resourceName = pieces[0];
  var uuid = pieces[1];
  if (!session.data.$(['Discovery', resourceName, 'by_uuid', uuid]).exists) {
    var beingFetched = session.data.$(['fetchingResource', reference]);
    if (!beingFetched.exists) {
      // set fetching flag and go ahead and fetch the resource
      beingFetched.value = true;

      var uri = api_server.host + api_server.paths.getResource;
      var params = {
        url: uri,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token
        },
        qs: {
          reference: reference
        }
      };
      console.log('getResource params = ' + JSON.stringify(params, null, 2));
      request(params, function(error, response, body) {
        console.log('*** getResource response: ' + JSON.stringify(response, null, 2));
        if (!error) {
          var resource;
          if (body === '') {
            resource = {};
          }
          else {
            resource = JSON.parse(body);
            cacheResource(resourceName, resource, session);
          }
          callback(false, resource);
        }
        else {
          console.log(error);
          callback(error);
        }
      });
    }
    else {
      // already in the process of being fetched, so no further action required
      callback(false);
    }
  }
  else {
    // already fetched and cached, so no further action required
    callback(false);
  }
};
