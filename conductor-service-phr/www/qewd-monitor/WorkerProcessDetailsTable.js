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

"use strict"

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var {
  Panel,
  Table,
  Button,
  Glyphicon,
  OverlayTrigger,
  Tooltip
} = ReactBootstrap;

var WorkerProcessDetails = require('./WorkerProcessDetails');
var Spinner = require('./Spinner');

var WorkerProcessDetailsTable = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-WorkerProcessDetailsTable')(this.props.controller, this);
    this.title = (
      <h2>Worker Process Details</h2>
    );
    this.tooltip = (
      <Tooltip 
        id = "workerProcessShutdownBtn"
      >
        Shutdown this Worker Process
      </Tooltip>
    );

  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering WorkerProcessDetails Table!');
    //var componentPath = this.controller.updateComponentPath(this);

    var rows = [];
    var row;
    var details;
    for (var i = 0; i < this.workerDetails.length; i++) {
      details = this.workerDetails[i];
	  //console.log('** details = ' + JSON.stringify(details));
      row = (
        <WorkerProcessDetails
          key = {details.pid}
          pid = {details.pid}
          memory = {details.memory}
          noOfRequests = {details.noOfMessages}
          available = {details.available.toString()}
          controller = {this.controller}
          stopWorker = {this.stopWorker}
        />
      );
      rows.push(row);
    }

    return (
      <Panel 
        header={this.title}
        bsStyle="info"
      >
        <Table 
          responsive  
          className = "overviewTable"
        >
          <thead>
            <tr>
              <th>PID</th>
              <th>Requests</th>
              <th>Available</th>
              <th className = "pushRight">
                PoolSize&nbsp;&nbsp;&nbsp;
                <Spinner
                  value = {this.poolSize}
                  changeHandler = {this.setPoolSize}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </Panel>
    );
  }
});

module.exports = WorkerProcessDetailsTable;
