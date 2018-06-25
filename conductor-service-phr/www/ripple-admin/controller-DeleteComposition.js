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

module.exports = function (controller, component) {

  component.patientId = '';
  component.heading = '';
  component.compositionId = '';

  controller.DeleteComposition = {
    onFieldChange: function(inputObj) {
      console.log('onFieldChange - ' + inputObj.ref + '; ' + inputObj.value);
      component[inputObj.ref] = inputObj.value;
    }
  };

  component.handleKeyDown = function(e) {
    // enter key pressed
    if (e.charCode === 13) {
      component.deleteComposition();
    }
  };

  component.deleteComposition = function() {

    console.log('***** delete composition! ****');
    console.log('patientId: ' + component.patientId);
    console.log('heading: ' + component.heading);
    console.log('sourceId: ' + component.compositionId);

    if (typeof component.patientId !== 'string' || component.patientId === '') {
      controller.displayError('You must enter a patient Id');
      return;
    }

    if (typeof component.heading !== 'string' || component.heading === '') {
      controller.displayError('You must enter a Heading');
      return;
    }

    if (typeof component.compositionId !== 'string' || component.compositionId === '') {
      controller.displayError('You must enter a Composition Id');
      return;
    }

    // send the message to delete the composition

    $.ajax({
      url: '/api/patients/' + component.patientId + '/' + component.heading + '/' + component.compositionId,
      method: 'DELETE',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + controller.token
      },
      dataType: 'json',
      timeout: 10000
    })
    .done(function(data) {
      console.log('*** received response: ' + JSON.stringify(data));
      controller.emit('compositionDeleted', {message: data});
    })
    .fail(function(err, textStatus, errorThrown) {
      console.log('*** Delete Composition error: ' + JSON.stringify(err));
      if (!err.responseJSON || !err.responseJSON.error) {
        controller.emit('error', {message: {error: 'Your request timed out'}});
      }
      else {
        controller.emit('error', {message: {error: err.responseJSON.error}});
      }
    });

  };

  return controller;
};
