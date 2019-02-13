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

 12 October 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');
//var DatePicker = require("react-16-bootstrap-date-picker");
//var DatePicker = require("react-input-calendar");
var FormField = require('./FormField');

//import DatePicker from 'react-input-calendar';
//import DatePicker from 'react-date-picker-cs';

//import 'react-day-picker/lib/style.css';
import DatePicker from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import 'moment/locale/en-gb';


var {
  Button,
  ControlLabel,
  FormGroup,
  Panel
} = ReactBootstrap;

var EditUser = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-EditUser').call(this, this.props.controller);

    this.title = (
      <span>
          <b>{this.props.title}</b>
          <Button 
            bsClass="btn btn-primary pull-right"
            onClick = {this.cancel}
          >
            Cancel
          </Button>
      </span>
    );
  },

  componentDidMount: function() {
  },
  
  componentWillReceiveProps: function(newProps) {

    for (var name in newProps.data) {
      this[name] = newProps.data[name];
    }

    this.title = (
      <span>
          <b>{newProps.title}</b>
          <Button 
            bsClass="btn btn-primary pull-right"
            onClick = {this.cancel}
          >
            Cancel
          </Button>
      </span>
    );
  },

  render: function() {

    console.log('rendering EditUser - show = ' + this.props.show);

    return (
      <div
        className = {this.props.show}
      >
        <Panel
          bsStyle="info"
        >
          <Panel.Heading>
   	     {this.title}
          </Panel.Heading>
          <Panel.Body>

            <FormField
              fieldname='email'
              label='Email Address'
              type='email'
              controller = {this.controller}
              focus={true}
              value = {this.props.data.email}
              formModule = 'EditUser'
            />
            <FormField
              fieldname='firstName'
              label='First Name'
              type='text'
              controller = {this.controller}
              focus={true}
              value = {this.props.data.firstName}
              formModule = 'EditUser'
              onFocus = {this.checkEmail}
            />
            <FormField
              fieldname='lastName'
              label='Last Name'
              type='text'
              controller = {this.controller}
              focus={true}
              value = {this.props.data.lastName}
              formModule = 'EditUser'
            />

            <FormField
              fieldname='nhsNumber'
              label='NHS Number'
              type='text'
              controller = {this.controller}
              focus={true}
              value = {this.props.data.nhsNumber}
              formModule = 'EditUser'
            />
            <FormGroup>
              <ControlLabel>Date of Birth</ControlLabel>
              <DatePicker
                formatDate = {formatDate}
                parseDate = {parseDate}
                placeholder = "DD/MM/YYYY"
                format = "L"
                dayPickerProps = {{
                  locale: 'en-gb',
                  localeUtils: MomentLocaleUtils,
                }}
                value = {this.props.data.dob} 
                onDayChange = {this.handleDateChange}
              />
            </FormGroup>
            <FormField
              fieldname='mobileNumber'
              label='Mobile Phone Number'
              type='tel'
              controller = {this.controller}
              focus={true}
              value = {this.props.data.mobileNumber}
              pattern = "\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*(\d{1,2})$"
              formModule = 'EditUser'
            />

            <Button 
              bsClass="btn btn-success"
              onClick = {this.saveUser}
            >
              Save
            </Button>

          </Panel.Body>
        </Panel>
      </div>
    );
  }
});

module.exports = EditUser;
