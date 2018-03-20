/*

 ----------------------------------------------------------------------------
 | ripple-auth0: Ripple MicroServices for Auth0                             |
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

  1 February 2018

*/

var request = require('request');
var jwt = require('jwt-simple');
var uuid = require('uuid/v4');

module.exports = function(args, finished) {

  //console.log('in getToken handler');

  var auth = this.userDefined.auth;
  var uri = 'https://' + auth.domain + '/oauth/token';
  var body = {
    grant_type: 'authorization_code',
    //grant_type: 'client_credentials',
    //type: 'web_server',
    client_id: auth.client_id,
    client_secret: auth.client_secret,
    code: args.req.query.code,
    redirect_uri: auth.callback_url
  };
  var indexUrl = auth.index_url || '/index.html';
  var pieces = indexUrl.split('/');
  pieces.pop();
  var cookiePath = pieces.join('/');
  if (cookiePath === '') cookiePath = '/';

  var options = {
    method: 'POST',
    uri: uri,
    json: true,
    body: body
  };

  console.log('about to post to Auth0: ' + JSON.stringify(options));

  request(options, function(error, response, body) {
    //console.log('** response: ' + JSON.stringify(response));
    //console.log('** body: ' + JSON.stringify(body));

    var id_token = jwt.decode(body.id_token, null, true);
    //args.session.oauth = id_token;

    var session = args.session;
    session.authenticated = true;
    session.timeout = 1200;  // 20 minutes timeout
    session.nhsNumber = id_token.nhs_number;
    var role = 'IDCR';
    if (id_token.role === 'PHR') role = 'phrUser';

    session.role = role;
    session.uid = uuid();
    session.auth0 = id_token;
    //session.makeSecret('auth0');

    finished({
      ok: true, 
      //qewd_redirect: '/phr/index.html'
      qewd_redirect: auth.index_url,
      cookiePath: cookiePath,
      cookieName: auth.cookie_name || 'JSESSIONID'
    });

  });

  /*
  errorCallback = finished;

  var callbackURL = this.oauth.config.callback_url;
  var self = this;
  this.oauth.client.authorizationCallback(callbackURL, args.req.query)
    .then(function (tokenSet) {

      //console.log('\nTokenSet: ' + JSON.stringify(tokenSet));

      var session = args.session;
      session.authenticated = true;
      //session.uid = uuid();
      session.timeout = tokenSet.refresh_expires_in;
      var verify_jwt = jwt.decode(tokenSet.id_token, null, true);
      session.nhsNumber = verify_jwt.nhsNumber;
      session.role = 'phrUser';
      session.uid = tokenSet.session_state;
      session.verify_jwt = verify_jwt;
      session.makeSecret('verify_jwt');

      console.log('verify_jwt = ' + JSON.stringify(verify_jwt, null, 2));

      // possibly use verify_jwt.sub as a key for a global or session record
      //  could use session and give it the same timeout as jwt

      finished({
        ok: true
        //tokenSet: tokenSet,
        //verify_jwt: verify_jwt
      });
  });
  */


};
