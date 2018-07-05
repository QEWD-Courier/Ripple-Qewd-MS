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

  27 June 2018

*/

function getHeadingSummaryFields(heading, controller, callback) {
  var self = this;
  if (!this.headingSummaryFields[heading]) {
    $.ajax({
      url: '/api/heading/' + heading + '/fields/summary',
      method: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + this.token
      },
      dataType: 'json',
      timeout: 10000
    })
    .done(function(data) {
      console.log('*** received response: ' + JSON.stringify(data));
      self.headingSummaryFields[heading] = data.results;
      if (data.token) {
        controller.token = data.token; // update the JWT
        console.log('JWT updated');
      }
      callback();
    })
    .fail(function(err, textStatus, errorThrown) {
      console.log('*** GetHeadingSummary error: ' + JSON.stringify(err));
      if (!err.responseJSON || !err.responseJSON.error) {
        controller.emit('error', {message: {error: 'Your request timed out'}});
        callback({error: true});
      }
      else {
        controller.emit('error', {message: {error: err.responseJSON.error}});
        callback({error: true});
      }
    });    
  }
  else {
    callback();
  }
}

module.exports = function (controller, component) {

  component.patientId = '';
  component.heading = '';
  component.headingListing = [];
  component.headingFields = [];
  component.headingSummaryFields = {};
  component.warningMessage = '';
  component.populate = {
    btnVisibility: 'hidden',
    patientId: '',
    heading: ''
  };

  controller.GetHeadingSummary = {
    onFieldChange: function(inputObj) {
      //console.log('onFieldChange - ' + inputObj.ref + '; ' + inputObj.value);
      component[inputObj.ref] = inputObj.value;
    }
  };

  component.handleKeyDown = function(e) {
    // enter key pressed
    if (e.charCode === 13) {
      component.deleteComposition();
    }
  };

  controller.on('HeadingDeleted', function(messageObj) {
    component.headingListing = [];
      component.setState({
        status: 'HeadingClearedDown'
      });
  });

  controller.on('headingListReceived', function(messageObj) {
    console.log('** headingListReceived: ' + JSON.stringify(messageObj));
    component.populate.btnVisibility = 'hidden';
    if (Array.isArray(messageObj.data)) {
      // Listing received
      component.headingFields = component.headingSummaryFields[messageObj.heading];
      component.headingListing = messageObj.data;

      if (messageObj.data.length === 0) {
        if (messageObj.warning) {
          component.warningMessage = messageObj.warning;
        }
        else {
          component.warningMessage = 'Unable to find any results for that patient and heading';
        }
        component.populate.btnVisibility = 'btn btn-primary';
      }

      component.setState({
        status: 'ListingReceived'
      });
    }
  });

  component.populatePatient = function() {
    console.log('*** populatePatient clicked');
    var populate = component.populate;

    if (populate.btnVisibility === 'hidden' || populate.patientId === '' || populate.heading === '') {
      controller.displayError('Patient Id and/or heading not specified yet');
      return;
    }

    component.patientId = component.populate.patientId;
    component.heading = component.populate.heading;

    controller.send({
      type: 'populatePatient',
      params: {
        patientId: component.patientId,
        heading: component.heading,
        jwt: controller.token
      }
    }, function(responseObj) {
      if (!responseObj.message.error) {
        console.log('populatePatient response: ' + JSON.stringify(responseObj, null, 2));
        var data = responseObj.message;
        if (Array.isArray(data) && data.length > 0) {
          component.populate = {
            btnVisibility: 'hidden',
            patientId: '',
            heading: ''
          };
          var dataObj = {
            heading: component.heading,
            data: data
          };
          controller.emit('headingListReceived', dataObj);
        }
        else {
          controller.displayError('Invalid response from CDR service');
        }
      }
    });

    //component.setState({
    //  status: 'populated'
    //});
  }

  component.getHeadingSummary = function() {

    if (typeof component.patientId !== 'string' || component.patientId === '') {
      controller.displayError('You must enter a patient Id');
      return;
    }

    if (typeof component.heading !== 'string' || component.heading === '') {
      controller.displayError('You must enter a Heading');
      return;
    }


    if (component.populate.patientId !== component.patientId) {
      component.populate.patientId = component.patientId;
      component.populate.btnVisibility = 'hidden';
    }
    if (component.populate.heading !== component.heading) {
      component.populate.heading = component.heading;
      component.populate.btnVisibility = 'hidden';
    }

    getHeadingSummaryFields.call(component, component.heading, controller, function(error) {
      if (!error) {
        $.ajax({
          url: '/api/patients/' + component.patientId + '/' + component.heading,
          method: 'GET',
          contentType: 'application/json',
          headers: {
            Authorization: 'Bearer ' + controller.token
          },
          dataType: 'json',
          timeout: 50000
        })
        .done(function(data) {
          console.log('*** received response: ' + JSON.stringify(data));
          var dataObj = {
            heading: component.heading,
            data: data
          };
          controller.emit('headingListReceived', dataObj);
        })
        .fail(function(err, textStatus, errorThrown) {
          console.log('*** GetHeadingSummary error: ' + JSON.stringify(err));
          if (!err.responseJSON || !err.responseJSON.error) {
            controller.emit('error', {message: {error: 'Your request timed out'}});
          }
          else {
            controller.emit('error', {message: {error: err.responseJSON.error}});
          }
        });
      }
    });
  };

  return controller;
};
