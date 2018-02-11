/*

 ------------------------------------------------------------------------------------
 | qewd-monitor: React.js-based Monitor/Management Application for QEWD             |
 |                                                                                  |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                                   |
 | Reigate, Surrey UK.                                                              |
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

  3 January 2016

*/

"use strict"

var React = require('react');
var ReactBootstrap = require('react-bootstrap');


var {
  Button,
  Modal,
  ModalTrigger,
  OverlayMixin
} = ReactBootstrap;

var LoginField = require('./LoginField');

var LoginModal = React.createClass({

  componentWillMount: function() {
    this.controller = require('./controller-LoginModal')(this.props.controller, this);
  },

  render: function() {

    //console.log('LoginModal rendering');
    //var componentPath = this.controller.updateComponentPath(this);

    return (

        <Modal
          show={this.props.show}
          backdrop='static'
          bsStyle='primary' 
          animation={true} 
          onKeyPress={this.handleKeyDown}
        >

          <Modal.Header>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <LoginField
              placeholder='Enter Management Password'
              fieldname='password'
              label='Management Password' 
              controller = {this.controller}
              focus={true}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.handleLogin} bsStyle='primary'>Login</Button>
          </Modal.Footer>

        </Modal>

    )
  }
});

module.exports = LoginModal;


