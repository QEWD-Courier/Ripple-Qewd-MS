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

  03 October 2018

*/

const { createKeyStore } = require('oidc-provider');
const fs = require('fs');
var global_config = require('/opt/qewd/mapped/settings/configuration.json');

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

function getAClaim(claimsDoc, name) {
  var id = claimsDoc.$(['by_name', name]).value;
  return claimsDoc.$(['by_id', id, 'fields']).getDocument(true);
}

function getClaims(claimsDoc) {
  var claims = {};
  claimsDoc.$('by_name').forEachChild(function(name) {
    var claim = getAClaim(claimsDoc, name);
    claims[name] = claim;
  });
  return claims;
}

module.exports = function(messageObj, session, send, finished) {
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
  openidDoc.$('grants').delete(); // clear down any previously logged grants

  var conductor = global_config.phr.microservices.conductor;
  var conductorHost = conductor.host + ':' + conductor.port;

  var params = {
    Claims: getClaims(openidDoc.$('Claims')),
    Users: openidDoc.$('Users').getDocument(true),
    path_prefix: global_config.phr.microservices.openid_connect.path_prefix || '',
    postLogoutRedirectUri: conductorHost
  }

  if (openidDoc.$('keystore').exists) {
    params.keystore = openidDoc.$('keystore').getDocument(true);
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
};
