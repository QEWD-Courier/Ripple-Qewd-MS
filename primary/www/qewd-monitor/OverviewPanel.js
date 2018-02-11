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
  Grid,
  Row,
  Col
} = ReactBootstrap;

var BuildDetails = require('./BuildDetails');
var MasterProcessDetails = require('./MasterProcessDetails');
var WorkerProcessDetailsTable = require('./WorkerProcessDetailsTable');

var OverviewPanel = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-OverviewPanel')(this.props.controller, this);
    this.title = (
      <h1>Overview {this.serverName}</h1>
    );
  },

  componentWillUpdate: function() {
    this.title = (
      <h1>Overview {this.serverName}</h1>
    );
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);

    if (this.state.status === 'initial') {
      return (
        <Panel collapsible expanded={this.expanded} header={this.title} />
      );
    }
    else {
      return (
        <Panel
          collapsible
          expanded={this.expanded}
          header={this.title}
          bsStyle="primary"
	 >
          <Grid
            fluid = {true}
          >
            <Row>
              <Col md={4}>
                <BuildDetails
                  controller = {this.controller}
                />
              </Col>
              <Col md={3}>
                <MasterProcessDetails
                  controller = {this.controller}
                />
              </Col>
              <Col md={5}>
                <WorkerProcessDetailsTable
                  controller = {this.controller}
                />
              </Col>
            </Row>
          </Grid>
        </Panel>
      );
    }
  }
});

module.exports = OverviewPanel;

