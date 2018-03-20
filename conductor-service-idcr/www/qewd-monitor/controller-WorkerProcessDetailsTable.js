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

  component.workers = {};

  component.onNewProps = function(newProps) {
    //console.log('WorkerProcessDetailsTable newProps: ' + JSON.stringify(newProps));
  };

  controller.on('stopWorkerProcess', function(messageObj) {
    controller.send({type: 'getWorkerDetails'});
  });

  component.stopWorker = function(pid) {
    controller.send({
      type: 'stopWorkerProcess',
      params: {
        pid: pid
      }
    });
    controller.toastr('warning', 'Worker ' + pid + ' shut down');
  };

  component.poolSize = 1;

  controller.on('startTimers', function() {
    if (!controller.timers.poolSize) {
      controller.timers.poolSize = setInterval(function() {
        controller.send({type: 'getPoolSize'});
      },15000);
    }
    if (!controller.timers.workerDetails) {
      controller.timers.workerDetails = setInterval(function() {
        controller.send({type: 'getWorkerDetails'});
      },10000);
    }
  });

  controller.on('getPoolSize', function(messageObj) {
    component.poolSize = messageObj.message.poolSize;
    controller.emit('startTimers');
    component.setState({
      status: 'poolSizeAvailable'
    });
  });

  component.setPoolSize = function(poolSize) {
    controller.send({
      type: 'setPoolSize',
      params: {
        poolSize: poolSize
      }
    });
  };

  component.workerDetails = [];

  controller.on('getWorkerDetails', function(messageObj) {
    //console.log('getWorkerDetails: ' + JSON.stringify(messageObj));
    component.workerDetails = messageObj.results;
    controller.emit('startTimers');

    component.setState({
      status: 'dataAvailable'
    });
  });

  controller.send({type: 'getWorkerDetails'});
  controller.send({type: 'getPoolSize'});

  return controller;
};
