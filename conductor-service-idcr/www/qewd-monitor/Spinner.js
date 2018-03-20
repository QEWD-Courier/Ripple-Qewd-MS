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
  ButtonGroup,
  Glyphicon
} = ReactBootstrap;

var value;

var Spinner = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {

    value = this.props.value;

    var component = this;

    this.increment = function() {
      value++;
      component.props.changeHandler(value);
      component.setState({
        status: 'update'
      });
    };

    this.decrement = function() {
      if (value > 1) {
        value--;
        component.props.changeHandler(value);
        component.setState({
          status: 'update'
        });
      }
    };
  },  

  componentWillReceiveProps: function(newProps) {
    value = newProps.value;
  },

  render: function() {
    return (

        <ButtonGroup>
          <Button>
           {value}
          </Button>
          <ButtonGroup
            vertical
          >
            <Button 
              bsStyle="default"
              bsSize = "xsmall"
              onClick = {this.increment}
            >
              <Glyphicon 
                glyph="triangle-top"
              />
            </Button>
            <Button 
              bsStyle="default"
              bsSize = "xsmall"
              onClick = {this.decrement}
            >
              <Glyphicon 
                glyph="triangle-bottom"
              />
            </Button>
          </ButtonGroup>
        </ButtonGroup>

    );
  }

});

module.exports = Spinner;
