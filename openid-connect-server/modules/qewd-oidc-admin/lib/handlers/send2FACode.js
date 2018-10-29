/*

 ----------------------------------------------------------------------------
 | qewd-oidc-admin: Administration Interface for QEWD OpenId Connect Server |
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

  02 October 2018

*/

var bcrypt = require('bcrypt');
var twilio = require('twilio');
var randomstring = require('randomstring');

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var twilio_params = global_config.twilio;

function sendText(message, telNo, callback) {
  var client = new twilio(twilio_params.accountSid, twilio_params.authToken);
  var options = {
    body: message,
    to: telNo,
    from: twilio_params.telNo
  };
  client.messages.create(options, callback);
}

function sendCode(accessUserId, session, callback) {

  var userDoc = this.db.use('OpenId', 'Access', 'by_id', accessUserId);
  var mobileNo = userDoc.$('mobileNo').value;
  mobileNo = mobileNo.toString();
  mobileNo = mobileNo.split(' ').join('');   // remove any spaces
  if (mobileNo[0] === '0') {
    mobileNo = '+44' + mobileNo.substr(1);
  }
  var code = randomstring.generate({
    length: 6,
    charset: 'numeric'
  });

  // save in session

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(code, salt);

  session.data.$('2fa').setDocument({
    code: hash,
    id: accessUserId,  // remember user Id based on their login
    expiry: Date.now() + 300000  // 5 minute expiry
  });

  // send text

  var message = 'Your Helm Code is ' + code;
  sendText(message, mobileNo, callback);
}

module.exports = sendCode;
