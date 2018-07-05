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

const LRU = require('lru-cache');
const epochTime = require('oidc-provider/lib/helpers/epoch_time');
const storage = new LRU({});

function grantKeyFor(id) {
  return `grant:${id}`;
}

function initialise_adapter(qoper8) {

  var q = qoper8;

  class qewd_adapter {

    constructor(name) {
      this.name = name;
    }

    key(id) {
      return `${this.name}:${id}`;
    }

    destroy(id) {
      const key = this.key(id);
      const grantId = storage.get(key) && storage.get(key).grantId;

      storage.del(key);

      if (grantId) {
        const grantKey = grantKeyFor(grantId);

        storage.get(grantKey).forEach(token => storage.del(token));
      }

      return Promise.resolve();
    }

    consume(id) {
      storage.get(this.key(id)).consumed = epochTime();
      return Promise.resolve();
    }

    async find(id) {
      console.log('***** in find with id = ' + id + '; ' + this.name);

      if (this.name === 'Client') {

        var results = await q.send_promise({
          type: 'getClient',
          params: {
            id: id
          }
        })
        .then (function(result) {
          if (result.error) return {};
          delete result.message.ewd_application;
          console.log('*** returned ' + JSON.stringify(result.message, null, 2));
          return result.message;
        });
        console.log('*!*!*! results = ' + results);
        return results;
      }
      else {
        console.log('storage.get(this.key(id)) = ' + JSON.stringify(storage.get(this.key(id)), null, 2));
        return Promise.resolve(storage.get(this.key(id)));
      }
    }

    upsert(id, payload, expiresIn) {
      const key = this.key(id);

      const { grantId } = payload;
      if (grantId) {
        const grantKey = grantKeyFor(grantId);
        const grant = storage.get(grantKey);
        if (!grant) {
          storage.set(grantKey, [key]);
        } else {
          grant.push(key);
        }
      }

      storage.set(key, payload, expiresIn * 1000);

      return Promise.resolve();
    }

    static connect(provider) { // eslint-disable-line no-unused-vars
      // noop
    }
  }
  return qewd_adapter
}


module.exports = initialise_adapter;
