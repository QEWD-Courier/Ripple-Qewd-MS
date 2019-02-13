/*

 ----------------------------------------------------------------------------
 | qewd-oidc-admin: Administration Interface for QEWD OpenId Connect Server |
 |                                                                          |
 | Copyright (c) 2018 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

 01 October 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');
var FormField = require('./FormField');

var {
  Button,
  ButtonGroup,
  Glyphicon,
  OverlayTrigger,
  Tooltip
} = ReactBootstrap;

var UserTableRow = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-UserTableRow').call(this, this.props.controller);

    this.editTooltip = (
      <Tooltip 
        id = "editUserBtn"
      >
        Edit this User
      </Tooltip>
    );

    this.deleteTooltip = (
      <Tooltip 
        id = "deleteUserBtn"
      >
        Delete This User
      </Tooltip>
    );

    this.sendEmailBtnTooltip = (
      <Tooltip 
        id = "sendEmailTTBtn"
      >
        This user has not yet been verified.  Click this button to send an email to the user
      </Tooltip>
    );

  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    console.log('Rendering UserTableRow');
    //var componentPath = this.controller.updateComponentPath(this);

    if (this.props.data.verified) {
      this.sendEmailBtnVisibility = 'hidden';
    }
    else {
      this.sendEmailBtnVisibility = 'btn btn-warning';
    }

    return (
      <tr>
        <td>
            {this.props.data.email}
        </td>
        <td>
            {this.props.data.firstName} {this.props.data.lastName}
        </td>
        <td>
            {this.props.data.nhsNumber}
        </td>
        <td>
            {this.props.data.dob}
        </td>
        <td>
            {this.props.data.mobileNumber}
        </td>
        <td>
            {this.props.data.owner}
        </td>
        <td>
          <ButtonGroup
            bsClass="pull-right"
          >

            <OverlayTrigger 
              placement="top" 
              overlay={this.sendEmailBtnTooltip}
            >
              <Button 
                bsStyle="warning"
                bsClass = {this.sendEmailBtnVisibility}
                onClick = {this.sendEmail}
              >
                <Glyphicon 
                  glyph="warning-sign"
                />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger 
              placement="top" 
              overlay={this.editTooltip}
            >
              <Button 
                bsStyle="info"
                onClick = {this.editUser}
                bsSize="small"
              >
                <Glyphicon 
                  glyph="info-sign"
                />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger 
              placement="top" 
              overlay={this.deleteTooltip}
            >
              <Button 
                bsStyle="danger"
                onClick = {this.deleteUser}
                bsSize="small"
              >
                <Glyphicon 
                  glyph="scissors"
                />
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
        </td>
      </tr>
    );
  }
});

module.exports = UserTableRow;
