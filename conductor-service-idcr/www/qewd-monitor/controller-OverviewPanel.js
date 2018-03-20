/*

 ------------------------------------------------------------------------------------
 | qewd-monitor: React.js-based Monitor/Management Application for QEWD             |
 |                                                                                  |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                                   |
 | Reigate, Surrey UK.                                                              |
 | All rights reserved.                                                             |
 |                                                                                  |
 | http://www.mgateway.com                                                          |
 | Email: rtweed@mgateway.com                                                       |
 |                                                                                  |
 |                                                                                  |
 | Licensed under the Apache License, Version 2.0 (the "License");                  |
 | you may not use this file except in compliance with the License.                 |
 | You may obtain a copy of the License at                                          |
 |                                                                                  |
 |     http://www.apache.org/licenses/LICENSE-2.0                                   |
 |                                                                                  |
 | Unless required by applicable law or agreed to in writing, software              |
 | distributed under the License is distributed on an "AS IS" BASIS,                |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.         |
 | See the License for the specific language governing permissions and              |
 |  limitations under the License.                                                  |
 ------------------------------------------------------------------------------------

  3 January 2016

*/

module.exports = function (controller, component) {

  component.onNewProps = function(newProps) {
    //console.log('OverviewPanel newProps: ' + JSON.stringify(newProps));
  };

  component.expanded = true;
  component.serverName = 'ewd-xpress';

  controller.on('getServerName', function(responseObj) {
    if (responseObj.message.serverName && responseObj.message.serverName !== '') {
      component.serverName = responseObj.message.serverName;
      component.setState({
        status: 'updated'
      });
    }
  });

  controller.send({
    type: 'getServerName'
  });

  return controller;
};
