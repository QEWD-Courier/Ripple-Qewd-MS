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

var router = require('qewd-router');

var getMyHeadingSummary = require('./handlers/getMyHeadingSummary');
var getMyHeadingDetail = require('./handlers/getMyHeadingDetail');
var getMySummary = require('./handlers/getMySummary');

var routes = {
  '/api/my/heading/:heading': {
    GET: getMyHeadingSummary
  },
  '/api/my/heading/:heading/:sourceId': {
    GET: getMyHeadingDetail
  },
  '/api/my/summary': {
    GET: getMySummary
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorised) {
      var role = req.session.role;
      console.log('*** role = ' + role + ' *****');
      if (req.path.startsWith('/api/my/') && role !== 'phrUser') {
        finished({error: 'Unauthorised request'});
        console.log('**** attempt to use an /api/my/ path by a non-PHR user ******');
        return false;
      }
      var sub = req.session.verify_jwt.sub;
      var qewdSession = this.sessions.byToken(sub);
      if (!qewdSession) {
        // New Verify JWT - need to create a new QEWD Session for it

        //console.log('**** application: ' + req.application + '; timeout: ' + req.session.timeout);
        qewdSession= this.sessions.create(req.application, req.session.timeout);
        var token = qewdSession.token;

        // swap QEWD Session token with JWT sub value
        var sessionGlo = this.db.use('CacheTempEWDSession');
        var sessionRec = sessionGlo.$(['session', qewdSession.id]);
        var sessionIndex = sessionGlo.$('sessionsByToken');
        sessionRec.$(['ewd-session', 'token']).value = sub;
        sessionIndex.$(sub).value = qewdSession.id;
        sessionIndex.$(token).delete();
        console.log('**** new QEWD Session created for sub ' + sub);

      }
      else {
        console.log('QEWD Session ' + qewdSession.id + ' exists for sub ' + sub);
      }
      req.qewdSession = qewdSession;
    }
    return authorised;
  }
};
