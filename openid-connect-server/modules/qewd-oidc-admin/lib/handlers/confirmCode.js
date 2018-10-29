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

  28 September 2018

*/

var bcrypt = require('bcrypt');

module.exports = function(messageObj, session, send, finished) {

  if (session.authenticated) {
    return finished({error: 'You are already logged in'});
  }

  if (!session.data.$('2fa').exists) {
    return finished({error: 'Invalid request'});
  }

  var twoFa = session.data.$('2fa').getDocument();

  if (twoFa.expiry < Date.now()) {
    return finished({expired: true});
  }

  var code = messageObj.params.code;

  if (!code || code === '') {
    return finished({error: 'You must enter the code that was sent to your mobile phone'});
  }

  var match = bcrypt.compareSync(code, twoFa.code);
  if (!match) {
    return finished({error: 'The code you entered does not match the code that was sent to your mobile phone'});
  }

  // The Code entered was correct - log in the user

  var userDoc = this.db.use('OpenId', 'Access', 'by_id', twoFa.id);
  var userType = userDoc.$('userType').value;
  var mode = userType;
  var verified = userDoc.$('verified').value;
  if (verified === 'pending_first_login') {
    mode = 'changePassword';  // force a password change next before logging the user in
  }

  session.data.$('userType').value = userType;
  session.data.$('userId').value = twoFa.id;
  session.authenticated = true;
  session.timeout = 1200;
  session.data.$('2fa').delete();
  finished({
    ok: true,
    mode: mode
  });
};
