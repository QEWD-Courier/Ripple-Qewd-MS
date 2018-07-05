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

module.exports = async function() {

  this.openid_server = {};

  var handleMessagePromise = function(messageObj) {
    var self = this;
    return new Promise((resolve) => {
      self.handleMessage(messageObj, function(responseObj) {
        resolve(responseObj);
      });
    });
  };

  async function sendAsync(message) {
    //message.application = 'openid-server';
    //message.expressType = message.type;
    //message.type = 'ewd-qoper8-express';
    console.log('*** send_promise - sendAsync - this.openid_server = ' + JSON.stringify(this.openid_server, null, 2));
    if (this.openid_server.token) message.token = this.openid_server.token;
    var self = this;
    return await handleMessagePromise.call(self, message);
  }

  this.send_promise = sendAsync.bind(this);

};
