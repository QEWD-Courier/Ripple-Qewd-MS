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
var ReactBootstrap = require('react-bootstrap');
var createReactClass = require('create-react-class');

var HeadingRow = require('./HeadingRow');

var {
  Button,
  Glyphicon,
  Modal,
  OverlayTrigger,
  Panel,
  Table,
  Tooltip
} = ReactBootstrap;

var HeadingTable = createReactClass({

  getInitialState: function() {
    return {
      status: 'initial'    }
  },

  componentWillMount: function() {
    this.controller = require('./controller-HeadingTable')(this.props.controller, this);

    this.title = (
      <h2>Heading Records</h2>
    );
  },

  componentDidUpdate: function() {
    var self = this;
    if (this.showHeadingDeleted) {
      setTimeout(function() {
        self.showHeadingDeleted = false;
        self.controller.emit('HeadingDeleted');
      }, 3000);
    }

    if (this.warningMessage && this.warningMessage !== '') {
      this.controller.toastr('info', this.warningMessage);
      this.warningMessage = '';
    }

  },

  componentWillReceiveProps: function(newProps) {
    console.log('HeadingTable receiving new props: ' + JSON.stringify(newProps));

    this.headingArray = newProps.data;
    this.headingFields = newProps.headingFields;
    this.showConfirm = false;
    this.showConfirmCleardown = false;
    this.showDeletion = false;
    this.showHeadingDeleted = false;
    this.sourceIdToDelete = false;
    this.sourceIdToDisplay = false;
    this.sourceToDisplay = false;
    this.isLocked = {};
  },

  logChange: function(option) {
    console.log('selected ' + JSON.stringify(option));
    
    //this.selectTag(option);
  }, 

  render: function() {

    console.log('Rendering HeadingTable');
    //var componentPath = this.controller.updateComponentPath(this);

    this.tooltip = (
      <Tooltip 
        id = "deleteHeadingTTBtn"
      >
        Delete all records from this heading
      </Tooltip>
    );

    this.title = (
      <span>
        <b>{this.props.heading} records Retrieved from OpenEHR System(s)</b>

        <OverlayTrigger 
          placement="top" 
          overlay={this.tooltip}
        >
          <Button 
            bsClass="btn btn-danger pull-right"
            onClick = {this.clearDownHeading}
          >
            <Glyphicon 
              glyph="trash"
            />
          </Button>
        </OverlayTrigger>
      </span>
    );

    var rows = [];
    var row;

    var self = this;
    this.headingArrayIndex = {};
    this.headingArray.forEach(function(record, index) {
      row = (
        <HeadingRow
          key = {index}
          fields = {self.headingFields}
          data = {record}
          id = {record.sourceId}
          controller={self.controller}
        />
      );
      rows.push(row);
      self.headingArrayIndex[record.sourceId] = index;
    });

    var headers = [];
    var header;

    this.headingFields.forEach(function(field) {
      header = (
        <th
          key = {field}
        >
          {field}
        </th>
      );
      headers.push(header);
    });

    return (
      <div>
        <Modal
          container = {document.body}
          show = {this.showConfirm}
        >
          <Modal.Header>
            <Modal.Title>Warning!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You are about to delete this record ({this.sourceIdToDisplay}) 
            from the {this.sourceToDisplay} OpenEHR Database.  Are you
            sure you want to do this?
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick = {this.cancelDelete}
            >
              No - Cancel
            </Button>
            <Button
              bsStyle="danger"
              onClick = {this.confirmDelete}
            >
              Yes - Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          container = {document.body}
          show = {this.showConfirmCleardown}
        >
          <Modal.Header>
            <Modal.Title>Warning!&nbsp;&nbsp;Warning!&nbsp;&nbsp;Warning!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              You are about to delete every {this.props.heading} record held on
              all OpenEHR systems for patient {this.props.patientId}
            </p>
            <p>
              Are you really sure you want to do this? This is your last chance to
              change you mind, and there is no way to reinstate the deleted records
              except by manually re-entering them!
            </p>
            <h4>
              Are you really sure you want to do this?
            </h4>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick = {this.cancelCleardown}
            >
              No - Cancel
            </Button>
            <Button
              bsStyle="danger"
              onClick = {this.confirmCleardown}
            >
              Yes - Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          container = {document.body}
          show = {this.showDeletion}
        >
          <Modal.Header>
            <Modal.Title>Record Deleted</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Composition {this.compositionId} has been deleted from {this.openEHRSource}
          </Modal.Body>
        </Modal>

        <Modal
          container = {document.body}
          show = {this.showHeadingDeleted}
        >
          <Modal.Header>
            <Modal.Title>Heading Cleared Down</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            The {this.heading} Heading has been cleared down for patient {this.patientId}.
          </Modal.Body>
        </Modal>

        <Panel
          bsStyle = "info"
        >
          <Panel.Heading>
   	     {this.title}
          </Panel.Heading>
          <Panel.Body>

            <Table 
              responsive  
            >
              <thead>
                <tr>
                  {headers}
                  <th>SourceId</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </Table>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
});

module.exports = HeadingTable;
