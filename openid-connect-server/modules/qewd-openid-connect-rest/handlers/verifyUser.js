/*

 ----------------------------------------------------------------------------
 | qewd-openid-connect: QEWD-enabled OpenId Connect Server                  |
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

  28 September 2018

*/

var randomstring = require('randomstring');
var bcrypt = require('bcrypt');
var mustache = require('mustache');
var fs = require('fs');

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var oidc_server = global_config.phr.microservices.openid_connect.host;
var port = global_config.phr.microservices.openid_connect.port;
var oidc_path_prefix = global_config.phr.microservices.openid_connect.path_prefix;
if (!oidc_server.startsWith('https://')) {
  if (port && port !== 80) {
    oidc_server = oidc_server + ':' + port;
  }
}

var helm_server = global_config.phr.microservices.conductor.host;
port = global_config.phr.microservices.conductor.port;
if (!helm_server.startsWith('https://')) {
  if (port && port !== 80) {
    helm_server = helm_server + ':' + port;
  }
}

function getTextFromFile(fileName) {
  var text = '';
  if (fs.existsSync(fileName)) {
    text = '';
    fs.readFileSync(fileName).toString().split(/\r?\n/).forEach(function(line){
      text = text + ' ' + line;
    });
  }
  return text;
}

module.exports = function(args, finished) {

  var token = args.token;
  if (!token || token === '') {
    return finished({error: 'Invalid Request a'});
  }

  var verifyDoc = this.db.use('OpenId', 'verify_pending', token);
  if (!verifyDoc.exists) {
    return finished({error: 'Invalid Request'});
  }

  var userDoc;

  var user = verifyDoc.getDocument();

  // Access Administrators

  if (user.type === 'Access') {
    userDoc = this.db.use('OpenId', 'Access', 'by_id', user.id);
    if (!userDoc.exists) {
      return finished({error: 'Invalid Request c'});
    }
    var password = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    userDoc.$('verified').value = 'pending_first_login';
    userDoc.$('password').value = hash;
    verifyDoc.delete();
    userDoc.$('verify_pending_token').delete();

    var text = getTextFromFile(__dirname + '/../webPageResponse.txt');

    var subst = {
      helm_url: oidc_server + oidc_path_prefix + '/oidc-admin',
      password: password
    };

    var html = mustache.render(text, subst);

    finished({
      html: html
    });
  }

  // Helm Users

  else if (user.type === 'User') {
    userDoc = this.db.use('OpenId', 'Users', 'by_id', user.id);
    if (!userDoc.exists) {
      return finished({error: 'Invalid Request c'});
    }
    var password = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    userDoc.$('verified').value = 'pending_first_login';
    userDoc.$('password').value = hash;
    verifyDoc.delete();
    userDoc.$('verify_pending_token').delete();

    var text = getTextFromFile(__dirname + '/../webPageResponse.txt');

    var subst = {
      helm_url: helm_server,
      password: password
    };

    var html = mustache.render(text, subst);

    finished({
      html: html
    });
  }

  else {
    return finished({error: 'Invalid Request b'});
  }
};
