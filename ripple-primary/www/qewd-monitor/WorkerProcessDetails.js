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
  Button,
  Glyphicon,
  OverlayTrigger,
  Popover,
  Table,
  Tooltip
} = ReactBootstrap;

var WorkerProcessDetails = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-WorkerProcessDetails')(this.props.controller, this);
    var id = 'worker' + this.props.pid + 'ShutdownBtn';
    this.tooltip = (
      <Tooltip 
        id = {id}
      >
        Shutdown this Worker Process
      </Tooltip>
    );
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering WorkerProcessDetails Row!');
    //var componentPath = this.controller.updateComponentPath(this);

    var title = 'Worker ' + this.props.pid + ' Memory';

    var memoryPopover = (
      <Popover id="worker-process-memory" title={title}>
        <Table>
          <tbody>
            <tr>
              <td>rss:</td>
              <td>{this.props.memory.rss}</td>
            </tr>
            <tr>
              <td>heapTotal:</td>
              <td>{this.props.memory.heapTotal}</td>
            </tr>
            <tr>
              <td>heapUsed:</td>
              <td>{this.props.memory.heapUsed}</td>
            </tr>
          </tbody>
        </Table>
      </Popover>
    );

    return (
      <tr>
        <td>
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="left"
            overlay={memoryPopover}
          >
            <span>{this.props.pid}</span>
          </OverlayTrigger>
        </td>
        <td>{this.props.noOfRequests}</td>
        <td>{this.props.available}</td>
        <td className = "pushRight">
          <OverlayTrigger 
            placement="top" 
            overlay={this.tooltip}
          >
            <Button 
              bsStyle="danger"
              onClick = {this.stopWorker}
            >
              <Glyphicon 
                glyph="remove"
              />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );
  }
});

module.exports = WorkerProcessDetails;
