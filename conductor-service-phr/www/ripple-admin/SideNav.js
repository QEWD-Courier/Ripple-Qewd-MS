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

var {
  Nav,
  NavItem,
  Navbar,
  NavDropdown,
  MenuItem,
  Glyphicon
} = ReactBootstrap;

var SideNav = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-OpenEHRMaint')(this.props.controller, this);
  },

  render: function() {
    console.log('Rendering SideNav');

    return (

        <Navbar
          fluid
          className = "sidebar"
          inverse
        >
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/">User Name</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Text
              className = "userMenu"
            >
              <Navbar.Link
                href="#"
              >
                <Glyphicon
                  glyph="home"
                />
              </Navbar.Link>
              <Navbar.Link
                href="#"
              >
                <Glyphicon
                  glyph="log-out"
                />
              </Navbar.Link>
            </Navbar.Text>
            <Nav>
              <NavDropdown
                id = "dropdown1"
                eventKey={1}
                title="Item 1"
              >
                <MenuItem
                  eventKey={1.1}
                  href="#"
                >
                  Item 1.1
                </MenuItem>
              </NavDropdown>
              <NavItem
                 eventKey={2}
              >
                Item 2
              </NavItem>
              <NavItem
                eventKey={3}
              >
                Item 3
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

       <div>
         Content here
       </div>

    );
  }

});

module.exports = SideNav;
