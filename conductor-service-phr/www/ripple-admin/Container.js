/*

 ------------------------------------------------------------------------------------
 | qewd-react-scaffold: React.js-based QEWD application scaffolding                 |
 |                                                                                  |
 | Copyright (c) 2017-18 M/Gateway Developments Ltd,                                |
 | Redhill, Surrey UK.                                                              |
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

  5 January 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');
var {
  Grid,
  Row,
  Col
} = ReactBootstrap;

var Panel = require('./Panel');

var Container = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-Container')(this.props.controller, this);
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);
    //console.log('OverviewContainer - this.hideContainer = ' + this.hideContainer);

    console.log('Container props: ' + JSON.stringify(this.props));

    return (
      <Grid
        fluid = {true}
        className = {this.hideContainer ? 'hidden' : ''}
      >
        <Row>
          <Col md={12}>
            <Panel
              controller = {this.controller}
              loginStatus = {this.props.status}
              title = {this.props.panelTitle}
              titleComponentClass = {this.props.panelTitleComponentClass}
              expanded = {this.props.panelInitiallyExpanded}
              bsStyle = {this.props.panelBsStyle}
              content = {this.props.panelContentComponent}
            />
          </Col>
        </Row>
      </Grid>
    );
  }
});

module.exports = Container;
