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
  Panel,
  Grid,
  Row,
  Col
} = ReactBootstrap;


var Pane = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {

    this.controller = require('./controller-Panel')(this.props.controller, this);

    if (this.props.content) {
      //console.log('this.props.content exists');
      this.content = React.createElement(this.props.content, {
        controller: this.controller,
        loginStatus: this.props.loginStatus
      });
    }
    else {
      //console.log('this.props.content doesnt exist');
      this.content = (<div>No content defined</div>);
    }

  },

  componentWillUpdate: function() {
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);

    //console.log('Panel props: ' + JSON.stringify(this.props));

    var props = {
      controller: this.controller
    };

    return (
      <Panel
        expanded={this.expanded}
        bsStyle={this.props.bsStyle}
        onToggle={this.onToggle}
      >

        <Panel.Heading>
          <Panel.Title 
            componentClass={this.props.titleComponentClass}
          >
            {this.titleText}
          </Panel.Title>
        </Panel.Heading>

        <Panel.Collapse>
          <Panel.Body>
            <Grid
              fluid = {true}
            >
              <Row>
                {this.content}
              </Row>
            </Grid>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
});

module.exports = Pane;
