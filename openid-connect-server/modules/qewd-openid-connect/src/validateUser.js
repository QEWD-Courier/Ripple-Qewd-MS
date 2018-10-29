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
var send2FACode = require('./send2FACode');

module.exports = function(messageObj, session, send, finished) {
  if (!messageObj.params) return finished({error: 'Neither email nor password was sent'});
  var email = messageObj.params.email;
  if (!email || email === '') return finished({error: 'Missing or blank email'});
  var password = messageObj.params.password;
  if (!password || password === '') return finished({error: 'Missing or blank password'});

  var usersDoc = this.db.use('OpenId', 'Users');
  var emailIndex = usersDoc.$(['by_email', email]);
  if (!emailIndex.exists) {
    return finished({error: 'Invalid login attempt'});
  }
  var id = emailIndex.value;
  var userDoc = usersDoc.$(['by_id', id]);
  if (!userDoc.exists) {
    return finished({error: 'Unexpected problem occurred'});
  }

  var hashedPassword = userDoc.$('password').value;
  var match = bcrypt.compareSync(password, hashedPassword);
  if (!match) {
    return finished({error: 'Invalid login attempt'});
  }

  console.log('sending 2FA code for ' + id);

  var verified = userDoc.$('verified').value;
  var resetPassword = (verified === 'pending_first_login');

  var params = {
    id: id,
    grant: messageObj.params.grant,
    accountId: email,
    resetPassword: resetPassword,
    session: session
  };

  send2FACode.call(this, params, function(response) {
    console.log('send2FAcode response: ' + JSON.stringify(response, null, 2));
    finished({
      ok: true
    });
  });
};
