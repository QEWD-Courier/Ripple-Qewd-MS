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
var moment = require('moment');
var {
  Button,
  Glyphicon,
  OverlayTrigger,
  Popover,
  Table,
  Tooltip
} = ReactBootstrap;

var SessionTableRow = require('./SessionTableRow');

var SessionTable = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-SessionTable')(this.props.controller, this);
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering SessionTable');
    //var componentPath = this.controller.updateComponentPath(this);

    var rows = [];
    var row;
    var session;
    var expiry;
    //console.log('this.props.sessions = ' + JSON.stringify(this.props.sessions));
    for (var i = 0; i < this.props.sessions.length; i++) {
      session = this.props.sessions[i];
      expiry = moment(new Date(session.expiry * 1000)).format('DD MMM YY, h:mm:ss a');
      row = (
        <SessionTableRow
          key = {session.id}
          pid = {session.id}
          application = {session.application}
          token = {session.token}
          expiry = {expiry}
          disabled = {session.disabled}
          controller={this.controller}
        />
      );
      rows.push(row);
    }

    //console.log('session rows: ' + JSON.stringify(rows));


    return (
        <Table 
          responsive  
          className = "overviewTable"
        >
        <thead>
          <tr>
            <th>Id</th>
            <th>Application</th>
            <th>Expiry</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
});

module.exports = SessionTable;
