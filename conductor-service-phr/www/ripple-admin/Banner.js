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

  12 June 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');
var {
  Nav,
  Navbar,
  NavItem
} = ReactBootstrap;

var Banner = createReactClass({

  componentWillMount: function() {
    this.controller = require('./controller-Banner')(this.props.controller, this);
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {
    console.log('render Banner: this.controller.userMode = ' + this.controller.userMode);
    //this.props.controller.updateComponentPath(this);


    var navItems = [];
    var navItem;
    var count = 0;
    var disabled = false;
    var self = this;
    this.navs.forEach(function(nav) {

      if (self.controller.userMode !== 'admin' && nav.disabled === 'dynamic') disabled = true;

      navItem = (
        <NavItem
          eventKey = {nav.eventKey}
          key = {count}
          disabled = {disabled}
        >
          {nav.text}
        </NavItem>
      );
      navItems.push(navItem);
      count++;
    });


    return (
      <div>
        <Navbar inverse >
          <Navbar.Brand>
            {this.props.controller.app.title}
          </Navbar.Brand>
          <Nav 
            onSelect = {this.props.controller.navOptionSelected}
          >
            {navItems}
          </Nav>
          <Nav
            pullRight
            onSelect = {this.props.controller.navOptionSelected}
          >
            <NavItem
              eventKey = "logout"
            >
              Logout
            </NavItem>
          </Nav>
        </Navbar>
      </div>
    );
  }
});

module.exports = Banner;


