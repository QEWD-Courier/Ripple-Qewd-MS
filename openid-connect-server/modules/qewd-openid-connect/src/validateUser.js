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

  14 November 2018

*/

var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var use2FA = (global_config.use2FA !== false);
var bcrypt = require('bcrypt');
var send2FACode = require('./send2FACode');

var failTimeout = 15 * 60 * 1000;  // 15 minute lockout

module.exports = function(messageObj, session, send, finished) {
  if (!messageObj.params) return finished({error: 'Invalid login attempt'});
  var email = messageObj.params.email;
  if (!email || email === '') return finished({error: 'Invalid login attempt'});
  var password = messageObj.params.password;
  if (!password || password === '') return finished({error: 'Invalid login attempt'});

  var grant = messageObj.params.grant;
  if (!grant || grant === '') {
    return finished({error: 'Invalid login attempt'});
  }

  var sessionGrantDoc = session.data.$(['grantLock', grant]);
  if (sessionGrantDoc.exists) {
    // the no of attempts against a specific grant doesn't time out

    if (sessionGrantDoc.$('lockedOut').exists) {
      return finished({error: 'Maximum Number of Attempts Exceeded'});
    }
  }
  // make sure they're not just trying a change of grant to bypass the above lock
  var sessionUsernameDoc = session.data.$(['usernameLock', email]);
  if (sessionUsernameDoc.exists) {
    if (sessionUsernameDoc.$('lockedOut').exists) {
      // a username-specific lockout expires after 15 minutes

      if (sessionUsernameDoc.$('expiry').value < Date.now()) {
        sessionUsernameDoc.delete();
      }
      else {
        return finished({error: 'Maximum Number of Attempts Exceeded'});
      }
    }
  }

  var noOfAttemptsByUsername;
  var noOfAttemptsByGrant;

  var usersDoc = this.db.use('OpenId', 'Users');
  var emailIndex = usersDoc.$(['by_email', email]);
  if (!emailIndex.exists) {
    noOfAttemptsByGrant = sessionGrantDoc.$('noOfAttempts').increment();
    noOfAttemptsByUsername = sessionUsernameDoc.$('noOfAttempts').increment();
    if (noOfAttemptsByGrant > 5 || noOfAttemptsByUsername > 5) {
      sessionGrantDoc.$('expiry').value = Date.now() + failTimeout;  // extend 5 minute expiry 
      sessionGrantDoc.$('lockedOut').value = true;
      sessionUsernameDoc.$('expiry').value = Date.now() + failTimeout;  // extend 5 minute expiry 
      sessionUsernameDoc.$('lockedOut').value = true;
      return finished({error: 'Maximum Number of Attempts Exceeded'});
    }
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
    noOfAttemptsByGrant = sessionGrantDoc.$('noOfAttempts').increment();
    noOfAttemptsByUsername = sessionUsernameDoc.$('noOfAttempts').increment();
    if (noOfAttemptsByGrant > 5 || noOfAttemptsByUsername > 5) {
      sessionGrantDoc.$('expiry').value = Date.now() + failTimeout;  // extend 5 minute expiry 
      sessionGrantDoc.$('lockedOut').value = true;
      sessionUsernameDoc.$('expiry').value = Date.now() + failTimeout;  // extend 5 minute expiry 
      sessionUsernameDoc.$('lockedOut').value = true;
      return finished({error: 'Maximum Number of Attempts Exceeded'});
    }
    return finished({error: 'Invalid login attempt'});
  }

  sessionUsernameDoc.delete();
  sessionGrantDoc.delete();

  if (!use2FA) {
    return finished({
      ok: true,
      accountId: email,
      resetPassword: false
  });
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
