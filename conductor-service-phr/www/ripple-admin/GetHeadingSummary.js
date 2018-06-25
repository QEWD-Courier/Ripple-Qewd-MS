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
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');

var FormField = require('./FormField');
var HeadingTable = require('./HeadingTable');

var {
  Button,
  Panel
} = ReactBootstrap;

var GetHeadingSummary = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-GetHeadingSummary')(this.props.controller, this);
  },
  
  componentWillReceiveProps: function(newProps) {
    //this.onNewProps(newProps);
  },

  componentDidUpdate: function() {
    if (this.warningMessage && this.warningMessage !== '') {
      this.controller.toastr('info', this.warningMessage);
      this.warningMessage = '';
    }
  },

  render: function() {

    //var componentPath = this.controller.updateComponentPath(this);

    console.log('Rendering GetHeadingSummary');

    var listing = (
      <div></div>
    );

    if (this.headingListing.length > 0) {
      listing = (
        <HeadingTable
          data = {this.headingListing}
          headingFields = {this.headingFields}
          patientId = {this.patientId}
          heading = {this.heading}
          controller = {this.controller}
        />
      );
    }

    return (

        <Panel
          bsStyle="info"
        >
          <Panel.Heading>
   	     Get a Summary Listing of a Heading for a Selected Patient
          </Panel.Heading>
          <Panel.Body>

            <FormField
              fieldname='patientId'
              label='Patient Id'
              type='text'
              controller = {this.controller}
              focus={true}
              value = {this.patientId}
              formModule = 'GetHeadingSummary'
            />
            <FormField
              fieldname='heading'
              label='Clinical Heading'
              type='text'
              controller = {this.controller}
              focus={false}
              value = {this.heading}
              formModule = 'GetHeadingSummary'
            />

            <Button 
              bsClass="btn btn-success"
              onClick = {this.getHeadingSummary}
            >
              Fetch Heading Records
            </Button>

            {listing}

          </Panel.Body>
        </Panel>
    );
  }

});

module.exports = GetHeadingSummary;
