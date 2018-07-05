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

  4 July 2018

*/


function initialise_account(qoper8) {

  var q = qoper8;

  class Account {
    constructor(id, userObj) {
      this.accountId = id; // the property named accountId is important to oidc-provider
      this.nhsNumber = userObj.nhsNumber;
      this.email = userObj.email;
    }

    // claims() should return or resolve with an object with claims that are mapped 1:1 to
    // what your OP supports, oidc-provider will cherry-pick the requested ones automatically

    claims() {
      console.log('**** claims called for ' + this.accountId);

      return {
        sub: this.accountId,
        email: this.email,
        nhsNumber: this.nhsNumber,
      };
    }

    static async findById(ctx, id) {
      console.log('Account findbyId: ' + id);

      var results = await q.send_promise({
        type: 'getUser',
        params: {
          id: id
        }
      })
      .then (function(result) {
        console.log('findbyId result = ' + JSON.stringify(result, null, 2));
        if (result.message.error) return undefined;
        delete result.message.ewd_application;
        console.log('*** returned ' + JSON.stringify(result.message, null, 2));
        return result.message;
      });
      console.log('*!*!*! results = ' + results);
      
      var record = new Account(id, results);
      console.log('findById: ' + JSON.stringify(record));
      return record;
    }

    static async authenticate(email, password) {
      if (!email || email === '') return {error: 'Email must be provided'};
      if (!password || password === '') return {error: 'Password must be provided'};
      const lowercased = String(email).toLowerCase();

      var results = await q.send_promise({
        type: 'validateUser',
        params: {
          email: email,
          password: password
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

      //const id = _.findKey(USERS, { email: lowercased });
      //if (!id) return {error: 'Invalid login attempt'};

      // this is usually a db lookup, so let's just wrap the thing in a promise

      //var userPassword = USERS[id].password;
      //if (userPassword && userPassword !== '') {
      //  if (password !== userPassword) {
      //    return {error: 'Invalid login attempt (2)'};
      //  }
      //}
      var response = new this(email, results);
      console.log('record matched: ' + JSON.stringify(response));
      return response;
    }
  }
  return Account;
}

module.exports = initialise_account;
