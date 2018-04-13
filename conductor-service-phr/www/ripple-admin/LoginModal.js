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

  21 February 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');


var {
  Button,
  Modal,
  ModalTrigger,
  OverlayMixin
} = ReactBootstrap;

var LoginField = require('./LoginField');

var LoginModal = createReactClass({

  componentWillMount: function() {
    this.controller = require('./controller-LoginModal')(this.props.controller, this);
  },

  render: function() {

    //console.log('LoginModal rendering');
    //var componentPath = this.controller.updateComponentPath(this);

    if (this.props.hideUsername) {
      this.modalTitle = 'Login with the QEWD Management Password';
      this.username = 'dummy';
    }

    return (

        <Modal
          show={this.props.show}
          backdrop='static'
          bsStyle='primary' 
          animation={true} 
          onKeyPress={this.handleKeyDown}
        >

          <Modal.Header>
            <Modal.Title>{this.modalTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>

            <LoginField
              placeholder={this.username.placeholder}
              fieldname='username'
              label={this.username.label}
              type='text'
              controller = {this.controller}
              focus={true}
              hide = {this.props.hideUsername}
            />

            <LoginField
              placeholder={this.password.placeholder}
              fieldname='password'
              type='password'
              label={this.password.label} 
              controller = {this.controller}
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
