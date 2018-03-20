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
  Popover,
  Tooltip
} = ReactBootstrap;

var MasterProcessDetails = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-MasterProcessDetails')(this.props.controller, this);
    this.title = (
      <h2>Master Process Details</h2>
    );
    this.tooltip = (
      <Tooltip 
        id = "masterProcessShutdownBtn"
      >
        Shutdown ewd-xpress
      </Tooltip>
    );

  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering MasterProcessDetails!');
    //var componentPath = this.controller.updateComponentPath(this);

    var memoryPopover = (
      <Popover
        id="master-process-memory"
        title="Master Process Memory"
      >
        <Table>
          <tbody>
            <tr>
              <td>rss:</td>
              <td>{this.master.memory.rss}</td>
            </tr>
            <tr>
              <td>heapTotal:</td>
              <td>{this.master.memory.heapTotal}</td>
            </tr>
            <tr>
              <td>heapUsed:</td>
              <td>{this.master.memory.heapUsed}</td>
            </tr>
          </tbody>
        </Table>
      </Popover>
    );

    return (
      <Panel 
        header={this.title}
        bsStyle="info"
      >
        <Table 
          responsive  
          className = "overviewTable"
        >
          <tbody>
            <tr>
              <td>
                <OverlayTrigger
                  trigger={['hover', 'focus']}
                  placement="right"
                  overlay={memoryPopover}
                >
                  <span>{this.pid}</span>
                </OverlayTrigger>
              </td>
              <td className="pushRight">
                <OverlayTrigger 
                  placement="top" 
                  overlay={this.tooltip}
                >
                  <Button 
                    bsStyle="danger"
                    onClick = {this.stopMasterProcess}
                  >
                    <Glyphicon 
                      glyph="remove"
                    />
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>Started</td>
              <td className="pushRight">{this.started}</td>
            </tr>
            <tr>
              <td>Uptime</td>
              <td className="pushRight">{this.upTime}</td>
            </tr>
          </tbody>
        </Table>
      </Panel>
    );
  }
});

module.exports = MasterProcessDetails;
