/*

 ----------------------------------------------------------------------------
 | ripple-admin: Ripple User Administration MicroService                    |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  13 June 2018

*/

"use strict"

var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var createReactClass = require('create-react-class');
var FormField = require('./FormField');

var {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Glyphicon,
  OverlayTrigger,
  Popover,
  Table,
  Tooltip
} = ReactBootstrap;

var HeadingRow = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-HeadingRow')(this.props.controller, this);

    this.deleteTooltip = (
      <Tooltip 
        id = "deleteTTBtn"
      >
        Delete this Record
      </Tooltip>
    );

    this.unlockedBtnTooltip = (
      <Tooltip 
        id = "unlockedTTBtn"
      >
        This record is unlocked and will be deleted if you opt to delete all records.
        Click the button to lock the record in order to protect it from deletion
      </Tooltip>
    );

    this.lockedBtnTooltip = (
      <Tooltip 
        id = "lockedTTBtn"
      >
        This record is locked and will NOT be deleted if you opt to delete all records.
        Click the button to unlock the record if you want it deleted.
      </Tooltip>
    );

  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    var tds = [];
    var td;
    var self = this;

    this.props.fields.forEach(function(fieldName, index) {
      var value = self.convert(self.props.data[fieldName]);
      td = (
        <td
          key = {index}
        >
          {value}
        </td>
      );
      tds.push(td);
    });

    console.log('rendering HeadingRow with data = ' + JSON.stringify(this.props.data));

    if (this.props.data.isLocked) {
      this.unlockedBtnVisibility = 'hidden';
      this.lockedBtnVisibility = 'btn btn-success';
      this.deleteBtnVisibility = 'hidden';
    }
    else {
      this.unlockedBtnVisibility = 'btn btn-warning';
      this.lockedBtnVisibility = 'hidden';
      this.deleteBtnVisibility = 'btn btn-danger';
    }

    return (
      <tr>
        {tds}
        <td>
            {this.props.id}
        </td>
        <td>
         <ButtonToolbar>
          <ButtonGroup
            bsClass="pull-right"
          >

              <OverlayTrigger 
                placement="top" 
                overlay={this.unlockedBtnTooltip}
              >
                <Button 
                  bsStyle="warning"
                  bsClass = {this.unlockedBtnVisibility}
                  onClick = {this.lockRecord}
                >
                  <Glyphicon 
                    glyph="warning-sign"
                  />
                </Button>
              </OverlayTrigger>

              <OverlayTrigger 
                placement="top" 
                overlay={this.lockedBtnTooltip}
              >
                <Button 
                  bsStyle="success"
                  bsClass = {this.lockedBtnVisibility}
                  onClick = {this.unlockRecord}
                >
                  <Glyphicon 
                    glyph="ban-circle"
                  />
                </Button>
              </OverlayTrigger>

            <OverlayTrigger 
              placement="top" 
              overlay={this.deleteTooltip}
            >
              <Button 
                bsClass={this.deleteBtnVisibility}
                onClick = {this.deleteHeading}
              >
                <Glyphicon 
                  glyph="trash"
                />
              </Button>
            </OverlayTrigger>

          </ButtonGroup>
         </ButtonToolbar>
        </td>
      </tr>
    );
  }
});

module.exports = HeadingRow;
