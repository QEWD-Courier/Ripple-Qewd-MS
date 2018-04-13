/*

 ----------------------------------------------------------------------------
 | ripple-auth: Ripple MicroServices for Authentication Services            |
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

  21 February 2018

*/

var router = require('qewd-router');
var jwt = require('jwt-simple');

var adminLogin = require('./admin/login');
var adminRegister = require('./admin/register');
var adminDocStatus = require('./admin/docStatus');

var path_to_auth;
var auth_module_name;

function getJWTFromCookie(headers) {
  var cookie = headers.cookie;
  if (!cookie) return {error: 'No Cookies'};

  var pieces = cookie.split(';');
  var token;
  pieces.forEach(function(piece) {
    if (piece.indexOf('JSESSIONID') !== -1) {
      token = piece.split('JSESSIONID=')[1];
    }
  });
  if (!token) return {error: 'No JSESSIONID Cookie'};
  var JWT;
  try {
   JWT = jwt.decode(token, null, true);
   return JWT;
  }
  catch(err) {
    return {error: err};
  }

}

module.exports = {
  init: function() {
    //console.log('*** running ripple-auth init() function');
    //console.log('userDefined: ' + JSON.stringify(this.userDefined));
    if (this.userDefined.auth && this.userDefined.auth.type) {
      var type = this.userDefined.auth.type;
      if (type === 'Auth0') auth_module_name = 'ripple-auth0';
      if (type === 'OpenID Connect') auth_module_name = 'ripple-oauth-openid';
    }
    if (auth_module_name) {
      path_to_auth = '../' + auth_module_name;
      var login = require(path_to_auth + '/handlers/login');
      var logout = require(path_to_auth + '/handlers/logout');
      var getToken = require(path_to_auth + '/handlers/getToken');
      var test = require(path_to_auth + '/handlers/test');
      var auth_module = require(path_to_auth);

      var routes = {
        '/api/auth/test': {
          GET: test
        },
        '/api/auth/login': {
          GET: login
        },
        '/api/auth/logout': {
          GET: logout
        },
        '/api/auth/token': {
          GET: getToken
        },
        '/api/auth/admin/login': {
          POST: adminLogin
        },
        '/api/auth/admin/register': {
          POST: adminRegister
        },
        '/api/auth/admin/docStatus': {
          GET: adminDocStatus
        },
      };

      if (auth_module_name === 'ripple-auth0') {
         routes['/api/auth/demo'] = {
           GET: require(path_to_auth + '/handlers/demo')
         };
      }

      router.addMicroServiceHandler(routes, module.exports);
      if (auth_module && auth_module.init) auth_module.init.call(this);
    }
  },

  beforeMicroServiceHandler: function(req, finished) {

    console.log('*** beforeMicroServiceHandler: req: ' + JSON.stringify(req));

    if (req.path === '/api/auth/admin/docStatus') return true;

    var checkIfAuthenticated = true;
    if (req.pathTemplate === '/api/auth/callback' || req.pathTemplate === '/api/auth/token') {
      req.headers.authorization = 'Bearer ' + req.token;
      checkIfAuthenticated = false;
    }

    if (req.path === '/api/auth/admin/login') {
      return true;
    }

    //if (req.path === '/api/auth/login' || req.path === '/api/auth/admin/login') {
    if (req.path === '/api/auth/login') {
      var validJWT = false;
      if (req.headers.authorization) {
        var fin = function(obj) {
           // dummy function to allow us to validate the JWT without finishing
           //  the replacement function simply logs any JWT errors to the console / log
           console.log('JWT Authorization header error:');
           console.log(JSON.stringify(obj));
        };

        validJWT = this.jwt.handlers.validateRestRequest.call(this, req, fin, true, true);
        //console.log('*&*&* validJWT = ' + validJWT);
      }
      if (validJWT) {
        if (req.path === '/api/auth/login') {
          // Valid JWT / QEWD Session, so bypass the login and signal to the browser not to redirect
          finished({
            authenticated: true
          });
          return false;
        }
        else {
          finished({
            ok: true
          });
          return false;
        }
      }
      return true;
    }
    else {
      return this.jwt.handlers.validateRestRequest.call(this, req, finished, true, checkIfAuthenticated);
    }
  }
};
