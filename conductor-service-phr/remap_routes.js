/*

 ----------------------------------------------------------------------------
 | conductor-service-phr: Ripple PHR Conductor MicroService                 |
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

  16 May 2018

*/

module.exports = {

  '/api/auth/demo': {
    to: function() {
      // this isn't allowed except as a redirected path, so force an error:

      return '/api/invalid';
    }
  },

  '/api/initialise': {

    to: function(config) {

      if (config.ripple_mode === 'demo') return '/api/auth/demo';

      return '/api/auth/login';
    },

    onResponse: function(responseObj) {
      // repackage response object and return it

      console.log('repackaging response for /api/initialise');

      // https://rippleosi.eu.auth0.com/authorize
      //   ?scope=openid profile email
      //   &response_type=code
      //   &connections[0]=Username-Password-Authentication
      //   &connections[1]=google-oauth2
      //   &connections[2]=twitter
      //   &sso=true
      //   &client_id=Ghi91Wk1PERQjxIN5ili6rssnl4em8In
      //   &redirect_uri=http://www.mgateway.com:8080/api/auth/token
      //      &auth0Client=eyJuYW1lIjoicWV3ZC1jbGllbnQiLCJ2ZXJzaW9uIjoiMS4yNi4wIn0=


      if (responseObj.authenticated) {
        // map back to what /api/initialised would have sent
        return {
          ok: true,
          mode: 'secure'
        };
      }

      return responseObj;

      //responseObj.redirectTo = 'openid';
      //return responseObj;

    }
  },

  '/api/logout': {

    to: function(config) {
      return '/api/auth/logout';
    }
  }

};