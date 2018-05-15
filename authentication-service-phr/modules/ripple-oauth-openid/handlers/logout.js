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

  12 February 2018

*/

var request = require('request');

function sendOk(data, callback) {

  var form = data.body.form;
  var setCookie = data.headers['set-cookie'][0];
  var cookie = setCookie.split(';')[0];
  console.log('&& cookie = ' + cookie);
  //request.cookie(cookie);

  console.log('** form = ' + JSON.stringify(form, null, 2));

  var options = {
    url: form.action,
    form: {
      logout: 'yes'
    },
    headers: {
      Cookie: cookie
    }
  };

  options.form[form.input.name] = form.input.value;

  console.log('*** logout form options: ' + JSON.stringify(options, null, 2));

  request.post(options, callback);
}

module.exports = function(args, finished) {

  finished({
    redirectURL: 'http://www.mgateway.com:8089/session/end'
  });
  return;

  if (args.session.openid && args.session.openid.id_token) {
    var id_token = args.session.openid.id_token;

    var uri = this.userDefined.auth.end_session_endpoint;

    if (!uri) return finished({
      ok: false
    });

    var options = {
      url: this.userDefined.auth.end_session_endpoint,
      method: 'GET',
      qs: {
        id_token_hint: id_token
      },
      json: true
    };

    console.log('**** OpenId end session / logout: options - ' + JSON.stringify(options, null, 2));

    request(options, function(error, response, body) {
      console.log('*** logout - response = ' + JSON.stringify(response));

      /*

      Response will look like this:

      {
        "form": {
          "id": "op.logoutForm",
          "method": "post",
          "action": "http://192.168.1.120:3002/session/end",
          "input": {
            "type": "hidden",
            "name": "xsrf",
            "value": "b40e3d9c02b21dc1870e7ef6ffb22464cd0526976bcd8dcc"
          }
        }
      }

      Construct a POST request that will log out the OP

      add another field: logout=yes

      */

      sendOk(response, function(error, response, body) {
        console.log('*** logout form response = ' + JSON.stringify(response));
        finished({
          ok: true,
          //qewd_redirect: 'http://dev.ripple.foundation:8000',
        });
      });
    });
  }
  else {
    finished({
      ok: false
    });
  }
};