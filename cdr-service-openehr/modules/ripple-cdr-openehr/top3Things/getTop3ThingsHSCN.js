/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  16 November 2018

*/

/*

Exteral request for Top 3 Things, eg from LTHT

Must be authenticated with an Access Token

  GET /api/hscn/ltht/top3Things/9999999000

*/

var tools = require('../src/tools');
var request = require('request');
var global_config = require('/opt/qewd/mapped/settings/configuration.json');

function getTop3ThingsHSCN(args, finished) {

  var site = args.site;
  if (site !== 'ltht') {
    return finished({error: 'Invalid site'});
  }

  // validate Access Token

  var auth = args.req.headers.authorization;
  var token = auth.split('AccessToken ')[1];

  // confirm token on OpenID Connect Server

  // credentials initially specific to LTHT

  var siteCredentials = 'bHRodF9oZWxtOjU3NTE2N2ZjLTcwMWItNGFkYi05MWIwLWI0NTc5ZmY5ZGQ1Ng=='
  var oidc = global_config.phr.microservices.openid_connect;

  var host = oidc.host;
  if (oidc.port !== 80 && oidc.port!==443) host = host + ':' + oidc.port;
  

  var options = {
    url: host + '/openid/token/introspection',
    headers: {
      Authorization: 'Basic ' + siteCredentials
    },
    form: {
      token: token
    },
    strictSSL: false
  };

  console.log('options: ' + JSON.stringify(options, null, 2));

  var _this = this;
  request.post(options, function(error, response, body) {
    var results;
    try {
      results = JSON.parse(body);
    }
    catch(err) {
      results = {};
    }
    console.log('results = ' + JSON.stringify(results, null, 2));
    if (results.active === true) {
      var patientId = args.patientId;

      var valid = tools.isPatientIdValid(patientId);
      if (valid.error) return finished(valid);

      var doc = _this.db.use('Top3Things');
      var sourceId = doc.$(['byPatient', patientId, 'latest']).value;

      if (sourceId === '') {
        return finished([]);
      }

      var top3 = doc.$(['bySourceId', sourceId]).getDocument();

      var detail = {
        source: 'QEWDDB',
        sourceId: sourceId,
        dateCreated: top3.date,
        name1: top3.data.name1,
        description1: top3.data.description1,
        name2: top3.data.name2,
        description2: top3.data.description2,
        name3: top3.data.name3,
        description3: top3.data.description3
      };
      finished(detail);
    }
    else {
      return finished({error: 'Invalid request'});
    }
  });
}

module.exports = getTop3ThingsHSCN;
