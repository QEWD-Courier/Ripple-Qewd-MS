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

  4 January 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');
var FormField = require('./FormField');

import Select from 'react-select';

var {
  Alert,
  Button,
  Col,
  ControlLabel,
  Glyphicon,
  Grid,
  OverlayTrigger,
  Panel,
  Row,
  Tooltip
} = ReactBootstrap;

var RegisterUser = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-RegisterUser')(this.props.controller, this);
  },

  componentDidMount: function() {
  },
  
  componentWillReceiveProps: function(newProps) {
    console.log('RegisterUser receiving new props: ' + JSON.stringify(newProps));
    //this.show = newProps.data.show;
    //this.options = newProps.data.options;
    //this.prefix = newProps.data.prefix || '';
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);

    console.log('rendering RegisterUser - loginStatus = ' + this.props.loginStatus);

    if (this.state.status === 'alert') {
      return (
        <Alert bsStyle="danger" onDismiss={this.reload}>
          <h4>You've created an Admin User</h4>
          <p>
            Click OK and log in as the user you've just created.
          </p>
          <p>
            <Button 
              bsStyle="danger"
              onClick = {this.reload}
            >
              Login
            </Button>
          </p>
        </Alert>
      );
    }

    var style = {};
    var panelTitle = 'Register a New Admin or IDCR User';
    if (this.props.loginStatus === 'addAdminUser') {
      style = {display: 'none'};
      panelTitle = 'Register the First Admin User';
    }

    console.log('userType: ' + JSON.stringify(this.userType));

    return (
      <div>
        <Panel
          bsStyle="info"
        >
          <Panel.Heading>
   	     {panelTitle}
          </Panel.Heading>
          <Panel.Body>

            <div style = {style}>
              <ControlLabel>User Type</ControlLabel>
              <Select
                name="userType"
                value = {this.userType.value}
                options={this.userType.options}
                onChange={this.userType.change}
              />
            </div>
            <FormField
              fieldname='username'
              label='Username'
              type='text'
              controller = {this.controller}
              focus={true}
              value = ''
              formModule = 'RegisterUser'
            />
            <FormField
              fieldname='password'
              label='Password'
              type='password'
              controller = {this.controller}
              focus={true}
              value = ''
              formModule = 'RegisterUser'
            />
            <FormField
              fieldname='password2'
              label='Re-Enter Password'
              type='password'
              controller = {this.controller}
              focus={true}
              value = ''
              formModule = 'RegisterUser'
            />

            <Button 
              bsClass="btn btn-success"
              onClick = {this.addUser}
            >
              Save
            </Button>

          </Panel.Body>
        </Panel>
      </div>
    );
  }
});

module.exports = RegisterUser;
