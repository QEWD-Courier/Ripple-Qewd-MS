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

  11 January 2018

*/

var jwt = require('jwt-simple');

module.exports = function(args, finished) {

  var callbackURL = this.oauth.config.callback_url;
  var self = this;
  this.oauth.client.authorizationCallback(callbackURL, args.req.query)
    .then(function (tokenSet) {

      var session = args.session;
      session.authenticated = true;
      session.timeout = tokenSet.refresh_expires_in;
      var verify_jwt = jwt.decode(tokenSet.id_token, null, true);
      session.nhsNumber = verify_jwt.nhsNumber;
      session.verify_jwt = verify_jwt;
      session.makeSecret('verify_jwt');

      // possibly use verify_jwt.sub as a key for a global or session record
      //  could use session and give it the same timeout as jwt

      finished({
        ok: true
        //tokenSet: tokenSet,
        //verify_jwt: verify_jwt
      });
  });



};