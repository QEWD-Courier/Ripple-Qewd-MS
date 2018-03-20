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
var {
  Button,
  Navbar
} = ReactBootstrap;

module.exports = createReactClass({

  restart: function() {
    location.reload();
  },

  componentWillMount: function() {
    this.controller = require('./controller-Shutdown')(this.props.controller, this);
  },

  render: function() {
    return (
      <div>
        <Navbar inverse >
          <Navbar.Brand>
            {this.title}
          </Navbar.Brand>
        </Navbar>
        <Button 
          bsStyle="success"
          onClick = {this.restart}
        >
          {this.buttonText}
        </Button>
      </div>       
    );
  }
});

