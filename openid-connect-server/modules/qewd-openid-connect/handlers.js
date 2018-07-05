/*

 ----------------------------------------------------------------------------
 | qewd-openid-connect: QEWD-enabled OpenId Connect Server                  |
 |                                                                          |
 | Copyright (c) 2018 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

  4 July 2018

*/

const { createKeyStore } = require('oidc-provider');
const fs = require('fs');

async function generate_keys() {
  const keystore = createKeyStore();
  return await keystore.generate('RSA', 2048, {
    alg: 'RS256',
    use: 'sig',
  }).then(function () {
    console.log('this is the full private JWKS:\n', keystore.toJSON(true));
    return keystore.toJSON(true);
  });
};

module.exports = {

  beforeHandler: function(messageObj, session, send, finished) {
    if (messageObj.type === 'login') return;
    if (!session.authenticated) {
      finished({error: 'User MUST be authenticated'});
      return false;
    }
  },

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
    getParams: function(messageObj, session, send, finished) {

      var self = this;

      // load up data if it's available

      if (messageObj.params && messageObj.params.documents) {
        var documents = messageObj.params.documents;
        if (documents.delete) {
          documents.delete.forEach(function(docName) {
            self.db.use(docName).delete();
          });
        }
        if (documents.documents) {
          var doc;
          for (var docName in documents.documents) {
            self.db.use(docName).setDocument(documents.documents[docName]);
          }
        }
        if (documents.removeThisFile) {
          fs.unlinkSync(messageObj.params.documentsPath);
        }
      }

      var openidDoc = this.db.use('OpenId');
      var params = openidDoc.getDocument(true);
      if (params.keystore) {
        finished(params);
      }
      else {
        generate_keys()
        .then (function(keystore) {
          openidDoc.$('keystore').setDocument(keystore);
          params.keystore = keystore;
          finished(params);
        });
      }
    },
    getClient: function(messageObj, session, send, finished) {
      var id;
      if (messageObj.params) id = messageObj.params.id;
      if (!id || id === '') {
        return finished({error: 'Missing or empty id'});
      }
      var clientDoc = this.db.use('OpenId', 'Clients', messageObj.params.id);
      if (clientDoc.exists) {
        finished(clientDoc.getDocument(true));
      }
      else {
        finished({error: 'No such Client'});
      }
    },
    getUser: function(messageObj, session, send, finished) {
      var id;
      if (messageObj.params) id = messageObj.params.id;
      if (!id || id === '') {
        return finished({error: 'Missing or empty id'});
      }
      var userDoc = this.db.use('OpenId', 'Users', messageObj.params.id);
      if (userDoc.exists) {
        finished({
          email: id,
          nhsNumber: userDoc.$('nhsNumber').value
        });
      }
      else {
        finished({error: 'No such User'});
      }
    },
    validateUser: function(messageObj, session, send, finished) {
      if (!messageObj.params) return finished({error: 'Neither email nor password was sent'});
      var email = messageObj.params.email;
      if (!email || email === '') return finished({error: 'Missing or blank email'});
      var password = messageObj.params.password;
      if (!password || password === '') return finished({error: 'Missing or blank password'});
      var userDoc = this.db.use('OpenId', 'Users', email);
      if (!userDoc.exists) {
        return finished({error: 'No such user'});
      }
      if (userDoc.$('password').value !== password) {
        return finished({error: 'Invalid login attempt'});
      }
      finished({
        email: email,
        nhsNumber: userDoc.$('nhsNumber').value
      });
    },
    keepAlive: function(messageObj, session, send, finished) {
      finished({ok: true});
    }
  }
};
