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

const Issuer = require('openid-client').Issuer;
var request = require('request');

var initialised = false;

function getRedirectURL(scope) {
  return this.auth.client.authorizationUrl({
    redirect_uri: this.auth.config.callback_url,
    scope: scope,
  });
}

function getPublicKey() {
    var options = {
      url: this.auth.config.issuer,
      method: 'GET',
      json: true
    };
   var self = this;
   request(options, function(error, response, body) {
     if (error) {
       console.log('*** error obtaining public key: ' + error);
     }
     else {
       self.auth.publicKey = '-----BEGIN PUBLIC KEY-----\n' + body.public_key + '\n-----END PUBLIC KEY-----';
       console.log('**** public key: ' + self.auth.publicKey);
     }
   });
}

/*
function oauthTest(args, finished) {
  console.log(util.inspect(args));

  var state = 'teststate';


  client.authorizationCallback(callbackURL, args.req.query, state) // => Promise
    .then(function (tokenSet) {



      nhsIssuer.keystore(true)
        .then(function(jwks) {
          var jwkObj = jwks.toJSON(true);
          console.log('keyStore: ' + util.inspect(jwkObj));

          
          jwt_key = j2p(jwkObj.keys[0]);

          // fetch public key from https://blue.testlab.nhs.uk/auth/realms/sandpit/
          //  response.public_key

          var pub_key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnU9S6rveQafFtm9rYoTKtkRBoEaGO25IDrfVjbaJofYz9+WulSILYlBCwI3UKP5I7aQhbRGZIL5WfOALcjb/hrm6z04zcdYPWoJaaNOvBBnBkLYUwiNl9dZw4nysEMbNwNJuNmYwCEI0Md997cCooILgxUwV4Z0OdCHbiChSi0hEqdwSTJy5txiaFZOwRL5bSr5CbGkEUA1CQTyG64mTOxSZEyzPUMxKSPD5nZI8iKeWPtmnEQIHczJWHbm7lvs+OeZT+Xs5jZ7smGPE934dpGy19ZnO3sQ6C+a5PVPZgNgn/kxaIsUGqpzTUpOg7H/pkONUjroguk1ssCEIiUBgfQIDAQAB';

          pub_key = '-----BEGIN PUBLIC KEY-----\n' + pub_key + '\n-----END PUBLIC KEY-----';

          finished({
            ok: true,
            tokenSet: tokenSet,
            query: args.req.query,
            jwt_key: jwt_key,
            decoded: jwt.decode(tokenSet.id_token, jwt_key),
            decoded2: jwt.decode(tokenSet.id_token, pub_key)
          });

      });

  });
}
*/

module.exports = {

  init: function() {
    console.log('oauth-openid init');
    if (!initialised) {
      console.log('initialising');
      this.auth = {};
      this.auth.config = this.userDefined.auth;
      getPublicKey.call(this);

      var config = this.auth.config;

      this.auth.issuer = new Issuer({
        issuer: config.issuer,
        authorization_endpoint: config.authorization_endpoint,
        token_endpoint: config.token_endpoint,
        userinfo_endpoint: config.userinfo_endpoint,
        introspection_endpoint: config.introspection_endpoint,
        jwks_uri: config.jwks_endpoint,
      });
      var issuer = this.auth.issuer;
      this.auth.client = new issuer.Client({
        client_id: config.client_id,
        client_secret: config.client_secret
      });

      var client = this.auth.client;
      this.auth.getRedirectURL = function(scope) {
        scope = scope || config.scope.login;
        return client.authorizationUrl({
          redirect_uri: config.callback_url,
          scope: scope,
        });
      }
      //console.log('this.auth should exist now: ');
      //console.log(JSON.stringify(this.auth));

      initialised = true;
    }
  }

};
