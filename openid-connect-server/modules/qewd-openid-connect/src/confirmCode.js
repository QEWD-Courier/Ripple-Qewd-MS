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

  23 October 2018

*/

var bcrypt = require('bcrypt');

module.exports = function(messageObj, session, send, finished) {
  if (!messageObj.params) return finished({error: 'No parameters were sent'});

  var code = messageObj.params.confirmCode;
  if (!code || code === '') return finished({error: 'Missing or blank Confirmation Code'});

  var grant = messageObj.params.grant;
  if (!grant || grant === '') return finished({error: 'Missing or blank Grant identifier'});

  /*
    session.data.$(['2fa', grant]).setDocument({
      code: hash,
      id: userId,  // remember user Id based on their login
      accountId: accountId,
      expiry: Date.now() + 300000  // 5 minute expiry
     });
  */

  var twoFaDoc = session.data.$(['2fa', grant]);

  if (!twoFaDoc.exists) {
    return finished({error: 'Invalid request'});
  }

  // how many attempts is this? max 5

  var noOfAttempts = twoFaDoc.$('noOfAttempts').increment();
  if (noOfAttempts > 5) {
    return finished({error: 'Maximum Number of Attempts Exceeded'});
  }

  var twoFa = twoFaDoc.getDocument();
  var now = Date.now();

  if (twoFa.expiry < now) {
    return finished({error: 'The confirmation code has expired.  Send a new one or log in again'});
  }

  var match = bcrypt.compareSync(code, twoFa.code);
  if (!match) {
    return finished({error: 'The code you entered does not match the code that was sent to your mobile phone'});
  }

  // code matched OK

  if (twoFa.resetPassword) {

    // retain the 2FA session data by grant id, but update its expiry to another 10 minutes

    twoFaDoc.$('expiry').value = now + 600000;

    return finished({
      ok: true,
      resetPassword: twoFa.resetPassword
    });
  }

  // otherwise we're finished with the 2FA code data

  twoFaDoc.delete();

  // get rid of any expired 2fa codes while we're here
  //  as well as the counters for login attempts by remote IP and grant
  
  session.data.$('2fa').forEachChild(function(grant, node) {
    if (node.$('expiry').value < now) node.delete();
  });

  session.data.$('grantLock').forEachChild(function(grant, node) {
    if (node.$('expiry').value < now) node.delete();
  });

  session.data.$('usernameLock').forEachChild(function(username, node) {
    if (node.$('expiry').value < now) node.delete();
  });

  finished({
    ok: true,
    accountId: twoFa.accountId,
    resetPassword: twoFa.resetPassword
  });

};
