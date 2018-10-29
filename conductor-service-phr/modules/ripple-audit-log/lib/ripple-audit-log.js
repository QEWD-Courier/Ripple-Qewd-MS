/*

 ----------------------------------------------------------------------------
 | ripple-audit-log: Ripple User Activity Audit / Log                       |
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

  05 October 2018

*/

var jwt_simple = require('jwt-simple');

module.exports = {
  handlers: {
    login: function(messageObj, session, send, finished) {
      if (messageObj.params.password === this.userDefined.config.managementPassword) {
        session.timeout = 20 * 60;
        session.updateExpiry();
        session.authenticated = true;
        finished({
          ok: true
        });
      }
      else {
        finished({ok: false});
      }
    },
    keepAlive: function(messageObj, session, send, finished) {
      // dummy method just to keep application token valid
      finished({ok: true});
    },

    save_to_audit: function(messageObj, session, send, finished) {
      // save a record of the incoming REST request to the audit log
      //  if available, parse the JWT to extract username
      //  index by username and date/time

      var jwt;
      var cookie = messageObj.params.cookie;
      if (cookie && cookie.indexOf('JSESSIONID=') !== -1) {
        jwt = cookie.split('JSESSIONID=')[1];
        jwt = jwt.split('; ')[0];
      }
      var email;
      var nhsNumber;
      if (jwt) {
        var decoded = jwt_simple.decode(jwt, null, true);
        console.log('JWT: ' + JSON.stringify(decoded, null, 2));
        email = decoded.email;
        nhsNumber = decoded.nhsNumber;
      }

      var auditDoc = this.db.use('RippleAudit');
      var id = auditDoc.$('next_id').increment();
      var now = Date.now();
      var data = {
        raw_data: messageObj.params,
        time: now
      };
      if (email && email !== '') data.email = email;
      if (nhsNumber && nhsNumber !== '') data.nhsNumber = nhsNumber;
      auditDoc.$(['by_id', id]).setDocument(data);
      auditDoc.$(['by_time', now, id]).value = id;
      if (email) {
        auditDoc.$(['by_email', email, id]).value = id;
      }
      if (nhsNumber) {
        auditDoc.$(['by_nhsNumber', nhsNumber, id]).value = id;
      }
      finished({ok: true});
    }

  }
};
