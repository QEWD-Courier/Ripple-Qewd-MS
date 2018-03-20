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

/*

  Creates the redirection URL to be sent to the browser and used by it
  to redirect to Auth0's login proxy form

  On valid login, Auth0 will send an access code to the specified
  Callback URL (/api/auth/token)

*/

var auth0Client = {
  name: 'qewd-client',
  version: '1.26.0'
};

auth0Client = JSON.stringify(auth0Client);

module.exports = function(args, finished) {
  var session = args.session;
  session.authenticated = false;

  /*
  https://example.eu.auth0.com/authorize?
   scope=openid
   &response_type=id_token
   &connections[0]=Username-Password-Authentication
   &connections[1]=google-oauth2
   &connections[2]=twitter
   &sso=true
   &client_id=xxxxxxxxxxxxxxxxx
   &redirect_uri=http://example.com:8080/api/auth/token
   &auth0Client=eyJuYW1lIjoicWV3ZC1jbGllbnQiLCJ2ZXJzaW9uIjoiMS4yNS4xIn0=
  */

  var auth = this.userDefined.auth;
  var url = 'https://' + auth.domain + '/authorize';
  url = url + '?scope=openid profile email';
  url = url + '&response_type=code';

  if (auth.connections && Array.isArray(auth.connections)) {
    auth.connections.forEach(function(connection, index) {
      url = url + '&connections[' + index + ']=' + connection;
    });
  }
  url = url + '&sso=true';
  url = url + '&client_id=' + auth.client_id;
  url = url + '&redirect_uri=' + auth.callback_url;
  url = url + '&auth0Client=' + new Buffer(auth0Client).toString('base64');

  finished({
    redirectURL: url
  });
};
