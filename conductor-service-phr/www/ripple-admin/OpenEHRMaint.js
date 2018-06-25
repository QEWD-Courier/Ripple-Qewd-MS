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

var GetHeadingSummary = require('./GetHeadingSummary');
var DeleteComposition = require('./DeleteComposition');
var DeleteHeading = require('./DeleteHeading');

var {
  Tabs,
  Tab
} = ReactBootstrap;

var OpenEHRMaint = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-OpenEHRMaint')(this.props.controller, this);
  },

  render: function() {
    console.log('Rendering openEHRMaint');

    if (this.controller.userMode !== 'admin') {
      return (
        <div></div>
      );
    }

    return (
      <Tabs defaultActiveKey={1} id="openEHR-Options">
        <Tab eventKey={1} title="Maintain Headings">
          <GetHeadingSummary
            controller = {this.controller}
          />
        </Tab>
      </Tabs>
    );
  }

});

module.exports = OpenEHRMaint;
