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

var loadAQLFile = require('./loadAQLFile');
var openEHR = require('./openEHR');
var template = require('qewd-template');

var aql = {};

function getEhrId(nhsNo, host) {
  return this.db.use('RippleNHSNoMap', ['byNHSNo', nhsNo, host]).value;
}

function getHostSpecificParams(nhsNo, aql) {
  var params = {};
  var servers = this.userDefined.openehr;
  for (var host in servers) {
    var subs = {
      ehrId: getEhrId.call(this, nhsNo, host)
    }
    params[host] = {
      qs: {
        aql: template.replace(aql, subs)
      }
    };
  }
  return params;
}

function getHeading(nhsNo, heading, session, openEHRSessions, callback) {

  if (!aql[heading]) {
    aql[heading] = loadAQLFile(heading);
    console.log('heading = ' + heading + ': aql = ' + JSON.stringify(aql));
  }

  var params = {
    heading: heading,
    callback: callback,
    url: '/rest/v1/query',
    method: 'GET',
    sessions: openEHRSessions
  };

  params.hostSpecific = getHostSpecificParams.call(this, nhsNo, aql[heading]);  

  params.processBody = function(body, host) { 
    //console.log('**** processBody for host ' + host);
    var results = [];
    if (!body) body = {
      resultSet: []
    };

    var headingCache = session.data.$('headings');
    var byPatientIdCache = headingCache.$(['byPatientId', nhsNo, heading]);
    var bySourceIdCache = headingCache.$(['bySourceId']);
    
    body.resultSet.forEach(function(result) {
      if (result.uid) {
        var sourceId = host + '-' + result.uid.split('::')[0];
        var record = {
          heading: heading,
          host: host,
          patientId: nhsNo,
          data: result
        };
        bySourceIdCache.$(sourceId).setDocument(record);
        var dateCreated = result.date_created || result.dateCreated;
        var date = new Date(dateCreated).getTime();

        byPatientIdCache.$(['byDate', date, sourceId]).value = '';
        byPatientIdCache.$(['byHost', host, sourceId]).value = '';
      }
    });
  };

  openEHR.requests(params);
}

module.exports = getHeading;
