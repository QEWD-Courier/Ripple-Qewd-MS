/*

 ----------------------------------------------------------------------------
 | ripple-oauth-openid: Ripple MicroServices for OAuth OpenId               |
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

  24 July 2018

*/

var jwt = require('jwt-simple');

var errorCallback;

process.on('unhandledRejection', function(reason, p){
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
  errorCallback({error: reason});
});

module.exports = function(args, finished) {

  if (args.req.query.error) {
    var error = args.req.query.error;
    if (args.req.query.error_description) {
      error = error + ': ' + args.req.query.error_description;
    }
    return finished({error: error});
  }

  errorCallback = finished;

  var auth = this.auth.config;

  var indexUrl = auth.index_url || '/index.html';
  var pieces = indexUrl.split('/');
  pieces.pop();
  var cookiePath = pieces.join('/');
  if (cookiePath === '') cookiePath = '/';

  var callbackURL = auth.callback_url;

  this.auth.client.authorizationCallback(callbackURL, args.req.query)
    .then(function (tokenSet) {

      console.log('\nTokenSet: ' + JSON.stringify(tokenSet));

      var session = args.session;
      session.authenticated = true;
      //session.uid = uuid();
      var verify_jwt = jwt.decode(tokenSet.id_token, null, true);
      session.nhsNumber = verify_jwt.nhsNumber;
      session.email = verify_jwt.email;

      if (tokenSet.refresh_expires_in) {
        session.timeout = tokenSet.refresh_expires_in;
      }
      else {
        session.timeout = verify_jwt.exp - verify_jwt.iat;
      }

      session.role = 'phrUser';
      session.uid = tokenSet.session_state;
      session.openid = verify_jwt;
      session.openid.id_token = tokenSet.id_token;
      //session.makeSecret('verify_jwt');

      //console.log('verify_jwt = ' + JSON.stringify(verify_jwt, null, 2));

      // possibly use verify_jwt.sub as a key for a global or session record
      //  could use session and give it the same timeout as jwt

      finished({
        ok: true,
        qewd_redirect: auth.index_url,
        cookiePath: cookiePath,
        cookieName: auth.cookie_name || 'JSESSIONID'
      });
  });
};
