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

  component.refresh = function() {
    var message = {
      type: 'getSessions'
    };
    controller.send(message, function(responseObj) {
      component.sessions = responseObj.message;
      component.setState({status: 'gotSessions'});
    });
  };

  controller.on('stopSession', function(responseObj) {
    component.refresh();
  });

  controller.on('refreshSessionDisplay', function() {
    component.sessionData = {};
    component.refresh();
  });

  controller.on('showSession', function(responseObj) {

    if (responseObj.message.error) {
      // the selected session no longer exists, so refresh the session table
      component.sessionData = {};
      component.refresh();
    }
    else {
      component.sessionData = responseObj.message;
      component.setState({status: 'showSession'});
    }
  });

  component.onNewProps = function(newProps) {
  };

  component.sessions = [];
  component.sessionData = {};

  return controller;
};
