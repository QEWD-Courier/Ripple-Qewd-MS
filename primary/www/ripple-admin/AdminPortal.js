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

var RegisterUser = require('./RegisterUser');

var {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Col,
  Glyphicon,
  Grid,
  OverlayTrigger,
  Panel,
  Row,
  Tooltip
} = ReactBootstrap;

var AdminPortal = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    //this.controller = require('./controller-SessionsPanel')(this.props.controller, this);
  },

  componentDidMount: function() {
  },
  
  componentWillReceiveProps: function(newProps) {
    //this.onNewProps(newProps);
  },

  startPHR: function() {
    document.location = this.props.controller.adminPortalURLs.phr;
  },

  startRipple: function() {
    console.log('Redirecting to Ripple');
    // need to get the URL from the configuration info
    document.location = this.props.controller.adminPortalURLs.ripple;
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);

    console.log('rendering AdminPortal - loginStatus = ' + this.props.loginStatus);

    console.log('URLs: ' + JSON.stringify(this.props.controller.adminPortalURLs));

    if (this.props.loginStatus === 'addAdminUser') {
      // no records are in the Admin Login Database yet
      //  Only allow this user to add 1 User, which must be an admin user
      //  They can then login

      return (
        <div>
          <RegisterUser
            controller = {this.props.controller}
            loginStatus = {this.props.loginStatus}
          />
        </div>
      );
    }

    var navBtns = (
      <ButtonToolbar>
        <ButtonGroup bsSize="large">
          <Button
            bsStyle = 'primary'
            onClick = {this.startPHR}
          >
            Go to Leeds PHR as IDCR User
          </Button>
          <Button
            bsStyle = 'success'
            onClick = {this.startRipple}
          >
            Go To Ripple as IDCR User
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    );

    if (this.props.loginStatus === 'admin') {
      // An admin user can add new admin & idcr users, or
      // can select to run Ripple or Leeds PHR as an IDCR user

      return (
        <div>
          {navBtns}

          <hr />

          <RegisterUser
            controller = {this.props.controller}
            loginStatus = {this.props.loginStatus}
          />
        </div>
      );
    }

    if (this.props.loginStatus === 'idcr') {
      // An IDCR user can select to run Ripple or Leeds PHR as an IDCR user
      return (
        <div>
          {navBtns}
        </div>
      );
    }

  }
});

module.exports = AdminPortal;
