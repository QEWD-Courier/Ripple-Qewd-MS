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

  16 February 2018

*/

"use strict"

var React = require('react');
var createReactClass = require('create-react-class');
var ReactBootstrap = require('react-bootstrap');

var {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Glyphicon,
  InputGroup,
  OverlayTrigger
} = ReactBootstrap;

var FormField = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    };
  },

  componentWillMount: function() {
    this.controller = require('./controller-FormField')(this.props.controller, this);
  },

  componentWillReceiveProps: function(newProps) {
    //console.log('FormField: newProps - ' + JSON.stringify(newProps));
    
    this.value = newProps.value || '';
    
  },

  render: function() {

    //console.log('FormField rendering');
    //console.log('Formfield props: ' + JSON.stringify(this.props));
    //this.controller.updateComponentPath(this);

    if (this.props.type === 'textarea') {
      if (this.props.height) {
        var style = {height: this.props.height};
        console.log('textarea style: ' + style);
        return (
          <FormGroup>
            <ControlLabel>{this.props.label}</ControlLabel>
            <FormControl
              autoFocus = {this.autofocus}
              componentClass={this.props.type}
              placeholder={this.props.placeholder}
              ref={this.props.fieldname}
              onChange={this.handleChange}
              style = {style}
              value = {this.value}
            />
            <FormControl.Feedback />
         </FormGroup>
        );
      }
      return (
        <FormGroup>
          <ControlLabel>{this.props.label}</ControlLabel>
          <FormControl
            autoFocus = {this.autofocus}
            componentClass={this.props.type}
            placeholder={this.props.placeholder}
            ref={this.props.fieldname}
            onChange={this.handleChange}
            value = {this.value}
          />
          <FormControl.Feedback />
       </FormGroup>
      );
    }

    if (this.props.type === 'static') {
      return (
        <FormGroup>
          <ControlLabel>{this.props.label}</ControlLabel>
          <FormControl.Static>
            {this.value}
          </FormControl.Static>
        </FormGroup>
      );
    }

    if (this.props.type === 'static-inline') {
      return (
        <Form inline>
          <FormGroup>
            <ControlLabel>{this.props.label}: &nbsp;</ControlLabel>
            <FormControl.Static>
              {this.value}
            </FormControl.Static>
          </FormGroup>
        </Form>
      );
    }

    if (this.props.type === 'text+button') {
      return (
        <FormGroup>
          <ControlLabel>{this.props.label}</ControlLabel>
          <InputGroup>
            <FormControl
              autoFocus = {this.autofocus}
              type={this.props.type}
              value={this.value}
              placeholder={this.props.placeholder}
              bsStyle={this.validationState()}
              ref={this.props.fieldname}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <Button
             componentClass={InputGroup.Button}
             className = 'inputGroupButton'
             onClick={this.props.btnHandler}
             bsStyle={this.props.btnStyle}
            >
              {this.props.btnText}
            </Button>
          </InputGroup>
        </FormGroup>
      );
    }

    if (this.props.type === 'text+button+glyphicon') {
      return (
        <FormGroup>
          <ControlLabel>{this.props.label}</ControlLabel>
          <InputGroup>
            <FormControl
              autoFocus = {this.autofocus}
              type={this.props.type}
              value={this.value}
              placeholder={this.props.placeholder}
              bsStyle={this.validationState()}
              ref={this.props.fieldname}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <Button
             componentClass={InputGroup.Button}
             className = 'inputGroupButton'
             onClick={this.props.btnHandler}
             bsStyle={this.props.btnStyle}
             bsSize={this.props.btnSize}
            >
              <Glyphicon 
                glyph = {this.props.glyph}
              />
            </Button>
          </InputGroup>
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl
          autoFocus = {this.autofocus}
          type={this.props.type}
          value={this.value}
          placeholder={this.props.placeholder}
          bsStyle={this.validationState()}
          ref={this.props.fieldname}
          onChange={this.handleChange}
        />
        <FormControl.Feedback />
     </FormGroup>
    );
  }
});

module.exports = FormField;
