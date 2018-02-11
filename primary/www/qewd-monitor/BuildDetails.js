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
  Panel,
  Table
} = ReactBootstrap;

var BuildDetails = React.createClass({

  getInitialState: function() {
    return {
      status: 'initial'
    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-BuildDetails')(this.props.controller, this);
    this.title = (
      <h2>Build Details</h2>
    );
  },

  componentWillReceiveProps: function(newProps) {
    this.onNewProps(newProps);
  },

  render: function() {

    //console.log('Rendering Build Details!');
    //var componentPath = this.controller.updateComponentPath(this);

    return (
      <Panel
	    header={this.title}
		bsStyle="info"
	  >
        <Table responsive  className="overviewTable">
          <thead>
            <tr>
              <th>Module</th>
              <th>Version/build</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Node.js</td>
              <td>{this.nodejsBuild}</td>
            </tr>
            <tr>
              <td>Database Interface</td>
              <td>{this.dbInterface}</td>
            </tr>
            <tr>
              <td>Database</td>
              <td>{this.db}</td>
            </tr>
            <tr>
              <td>QEWD</td>
              <td>{this.xpressBuild}</td>
            </tr>
            <tr>
              <td>ewd-qoper8</td>
              <td>{this.qoper8Build}</td>
            </tr>
            <tr>
              <td>ewd-document-store</td>
              <td>{this.docStoreBuild}</td>
            </tr>
            <tr>
              <td>ewd-qoper8-express</td>
              <td>{this.qxBuild}</td>
            </tr>
          </tbody>
        </Table>
      </Panel>
    );
  }
});

module.exports = BuildDetails;

