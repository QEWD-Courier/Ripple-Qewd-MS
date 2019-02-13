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

 26 September 2018

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
  InputGroup
} = ReactBootstrap;

var FormField = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'
    };
  },

  componentWillMount: function() {
    this.controller = require('./controller-FormField').call(this, this.props.controller);
  },

  componentWillReceiveProps: function(newProps) {
    //console.log('FormField: newProps - ' + JSON.stringify(newProps));
    this.newProps(newProps);
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
              inputRef = {ref => { this.ref = ref; }}
              componentClass={this.props.type}
              placeholder={this.props.placeholder}
              onChange={this.handleChange}
              onFocus={this.props.onFocus}
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
            inputRef = {ref => { this.ref = ref; }}
            componentClass={this.props.type}
            placeholder={this.props.placeholder}
            onChange={this.handleChange}
            onFocus={this.props.onFocus}
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
              inputRef = {ref => { this.ref = ref; }}
              placeholder={this.props.placeholder}
              bsStyle={this.validationState()}
              onChange={this.handleChange}
              onFocus={this.props.onFocus}
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
              inputRef = {ref => { this.ref = ref; }}
              placeholder={this.props.placeholder}
              bsStyle={this.validationState()}
              onChange={this.handleChange}
              onFocus={this.props.onFocus}
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

    if (this.props.type === 'tel') {

      return (
        <FormGroup>
          <ControlLabel>{this.props.label}</ControlLabel>
          <FormControl
            inputRef = {ref => { this.ref = ref; }}
            autoFocus = {this.autofocus}
            type = "tel"
            value={this.value}
            placeholder={this.props.placeholder}
            pattern={this.props.pattern}
            bsStyle={this.validationState()}
            onChange={this.handleChange}
            onFocus={this.props.onFocus}
            onBlur={this.validateTel}
          />
          <FormControl.Feedback />
       </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl
          inputRef = {ref => { this.ref = ref; }}
          autoFocus = {this.autofocus}
          type={this.props.type}
          value={this.value}
          placeholder={this.props.placeholder}
          bsStyle={this.validationState()}
          onChange={this.handleChange}
          onFocus={this.props.onFocus}
        />
        <FormControl.Feedback />
     </FormGroup>
    );
  }
});

module.exports = FormField;
