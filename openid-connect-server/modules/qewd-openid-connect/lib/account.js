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

  04 October 2018

*/

var util = require('util');


function initialise_account(qoper8) {

  var q = qoper8;

  class Account {
    constructor(id, userObj) {
      this.accountId = id; // the property named accountId is important to oidc-provider
      this.claims = {};
      for (var name in userObj) {
        this.claims[name] = userObj[name];
      }
      //this.nhsNumber = userObj.nhsNumber;
      //this.email = userObj.email;
    }

    // claims() should return or resolve with an object with claims that are mapped 1:1 to
    // what your OP supports, oidc-provider will cherry-pick the requested ones automatically

    claims() {
      console.log('**** claims called for ' + this.accountId);

      var data = {
        sub: this.accountId
      };
      for (var name in this.claims) {
        data[name] = this.claims[name];
      }

      return data;

      /*
        sub: this.accountId,
        email: this.email,
        nhsNumber: this.nhsNumber,
      };
      */
    }

    static async findById(ctx, id) {
      console.log('Account findbyId: ' + id);

      return {
        accountId: id,
        // @param use {string} - can either be "id_token" or "userinfo", depending on
        //   where the specific claims are intended to be put in
        // @param scope {string} - the intended scope, while oidc-provider will mask
        //   claims depending on the scope automatically you might want to skip
        //   loading some claims from external resources or through db projection etc. based on this
        //   detail or not return them in ID Tokens but only UserInfo and so on
        // @param claims {object} - the part of the claims authorization parameter for either
        //   "id_token" or "userinfo" (depends on the "use" param)
        // @param rejected {Array[String]} - claim names that were rejected by the end-user, you might
        //   want to skip loading some claims from external resources or through db projection

        async claims(use, scope, claims, rejected) {
          console.log('!!!!! scope = ' + scope);

          var results = await q.send_promise({
            type: 'getUser',
            params: {
              id: id,
              scope: scope
            }
          })
          .then (function(result) {
            console.log('findbyId result = ' + JSON.stringify(result, null, 2));
            if (result.message.error) return undefined;
            delete result.message.ewd_application;
            console.log('*** returned ' + JSON.stringify(result.message, null, 2));
            return result.message;
          });
          return results;
          /*
          return {
            sub: id,
            email: id,
            nhsNumber: 9999999015
          };
          */
          
        }
      };

    }

    static async authenticate(email, password, grant) {
      if (!email || email === '') return {error: 'Email must be provided'};
      if (!password || password === '') return {error: 'Password must be provided'};
      const lowercased = String(email).toLowerCase();

      var results = await q.send_promise({
        type: 'validateUser',
        params: {
          email: email,
          password: password,
          grant: grant
        }
      })
      .then (function(result) {
        console.log('validateUser result = ' + JSON.stringify(result, null, 2));
        delete result.message.ewd_application;
        if (result.message.error) return result.message;
        console.log('*** returned ' + JSON.stringify(result.message, null, 2));
        return result.message;
      });
      console.log('*!*!*! results = ' + JSON.stringify(results, null, 2));

      if (results.error) return results;

      return results;

      //  accountId: results.email
      //};

      //const id = _.findKey(USERS, { email: lowercased });
      //if (!id) return {error: 'Invalid login attempt'};

      // this is usually a db lookup, so let's just wrap the thing in a promise

      //var userPassword = USERS[id].password;
      //if (userPassword && userPassword !== '') {
      //  if (password !== userPassword) {
      //    return {error: 'Invalid login attempt (2)'};
      //  }
      //}

      //var response = new this(email, results);
      //console.log('record matched: ' + JSON.stringify(response));
      //return response;
    }

    static async confirmCode(confirmCode, grant) {
      if (!confirmCode || confirmCode === '') return {error: 'You did not enter the confirmation code'};

      var results = await q.send_promise({
        type: 'confirmCode',
        params: {
          confirmCode: confirmCode,
          grant: grant
        }
      })
      .then (function(result) {
        delete result.message.ewd_application;
        if (result.message.error) return result.message;
        return result.message;
      });
      //if (results.error) return results;
      return results;
    }

    static async changePassword(password, password2, grant) {
      if (!password || password === '') return {error: 'You did not enter a new password'};
      if (!password2 || password2 === '') return {error: 'You did not re-enter a new password'};
      if (password !== password2) return {error: 'Those passwords do not match'};

      // at least 1 upper case
      // at least 1 lower case
      // at least 1 number
      // at least 7 characters long
      var passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{7,})");

      if (!passwordPattern.test(password)) {
        return {error: 'Your password does not meet the necessary requirements'};
      }

      var results = await q.send_promise({
        type: 'changePassword',
        params: {
          password: password,
          grant: grant
        }
      })
      .then (function(result) {
        console.log('ChangePassword result = ' + JSON.stringify(result, null, 2));
        delete result.message.ewd_application;
        if (result.message.error) return result.message;
        console.log('*** returned ' + JSON.stringify(result.message, null, 2));
        return result.message;
      });
      console.log('*!*!*! results = ' + JSON.stringify(results, null, 2));

      //if (results.error) return results;
      return results;
    }

    static async requestNewPassword(email) {
      if (!email || email === '') return {error: 'You did not enter your email address'};

      var results = await q.send_promise({
        type: 'requestNewPassword',
        params: {
          email: email
        }
      })
      .then (function(result) {
        console.log('requestNewPassword result = ' + JSON.stringify(result, null, 2));
        delete result.message.ewd_application;
        if (result.message.error) return result.message;
        console.log('*** returned ' + JSON.stringify(result.message, null, 2));
        return result.message;
      });
      return results;

    }

  }
  return Account;
}

module.exports = initialise_account;
