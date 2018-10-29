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

  04 October 2018

*/

var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var randomstring = require('randomstring');
var mustache = require('mustache');
var fs = require('fs');

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var nodemailer_params = global_config.email_server;
var oidc_server = global_config.phr.microservices.openid_connect.host;
var port = global_config.phr.microservices.openid_connect.port;
if (!oidc_server.startsWith('https://')) {
  if (port && port !== 80) {
    oidc_server = oidc_server + ':' + port;
  }
}
var email_options = global_config.user_verify_email;

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

var transporter = nodemailer.createTransport(nodemailer_params);

module.exports = function(messageObj, session, send, finished) {

  var email = messageObj.params.email;

  var usersDoc = this.db.use('OpenId', 'Users');
  var emailIndex = usersDoc.$(['by_email', email]);

  if (!emailIndex.exists) {
    return finished({error: 'Unrecognised email address'});
  }

  var id = emailIndex.value;
  var userDoc = usersDoc.$(['by_id', id]);
  if (!userDoc.exists) {
    return finished({error: 'A problem occurred when accessing your account.  Please contact your Helm Administrator'});
  }

  var password = randomstring.generate({
    length: 6,
    charset: 'numeric'
  });
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  userDoc.$('verified').value = 'pending_first_login';
  userDoc.$('password').value = hash;
  userDoc.$('updatedAt').value = new Date().toISOString();
  userDoc.$('modifiedBy').value = id;
  
  var text = getTextFromFile(__dirname + '/../requestNewPasswordEmail.txt');

  var subst = {
    password: password
  };

  var html = mustache.render(text, subst);

  var mailOptions = {
    from: email_options.from,
    to: email,
    subject: email_options.subject,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('** emailing error: ' + error);
      return finished({error: error});
    }
    console.log('** email info: ' + JSON.stringify(info, null, 2));
    finished({
      ok: true,
      info: info
    });
  });

};


