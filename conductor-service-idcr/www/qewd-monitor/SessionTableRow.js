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

var SessionTableRow = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-SessionTableRow')(this.props.controller, this);
    var id = 'Session' + this.props.pid + 'StopBtn';
    this.stopTooltip = (
      <Tooltip
        id = {id}
      >
        Stop and Delete this Session
      </Tooltip>
    );
    id = 'Session' + this.props.pid + 'ShowBtn';
    this.showTooltip = (
      <Tooltip
        id = {id}
      >
        Show Session Details
      </Tooltip>
    );

  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering SessionTableRow');
    //var componentPath = this.controller.updateComponentPath(this);

    return (
      <tr>
        <td>
            {this.props.pid}
        </td>
        <td>{this.props.application}</td>
        <td>{this.props.expiry}</td>
        <td>
          <OverlayTrigger 
            placement="top" 
            overlay={this.stopTooltip}
          >
            <Button 
              bsStyle="danger"
              onClick = {this.stopSession}
              bsSize="small"
              disabled = {this.props.disabled}
            >
              <Glyphicon 
                glyph="remove"
              />
            </Button>
          </OverlayTrigger>
        </td>
        <td>
          <OverlayTrigger 
            placement="top" 
            overlay={this.showTooltip}
          >
            <Button 
              bsStyle="info"
              onClick = {this.showSession}
              bsSize="small"
            >
              <Glyphicon 
                glyph="list-alt"
              />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );
  }
});

module.exports = SessionTableRow;
