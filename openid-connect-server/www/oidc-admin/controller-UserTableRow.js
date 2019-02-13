/*

 ----------------------------------------------------------------------------
 | qewd-oidc-admin: Administration Interface for QEWD OpenId Connect Server |
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

 26 September 2018

*/

module.exports = function (controller) {

  var self = this;

  this.onNewProps = function(newProps) {
  };

  this.deleteUser = function() {
    console.log('data: ' + JSON.stringify(self.props.data, null, 2));
    controller.emit('deleteUser', self.props.data);
  }

  this.editUser = function() {
    console.log('data: ' + JSON.stringify(self.props.data, null, 2));
    controller.emit('editUser', self.props.data);
  }

  this.sendEmail = function() {
    controller.emit('sendUserEmail', self.props.data.id);
  }

  return controller;
};
