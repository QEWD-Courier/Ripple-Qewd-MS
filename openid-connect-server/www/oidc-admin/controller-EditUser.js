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

 05 October 2018

*/

module.exports = function (controller) {

  var self = this;

  this.cancel = function() {
    self.controller.emit('cancelAddUser');      
  };

  controller.EditUser = {
    onFieldChange: function(inputObj) {
      console.log('onFieldChange - ' + inputObj.ref + '; ' + inputObj.value);
      self[inputObj.ref] = inputObj.value;
      controller.EditUser.refs[inputObj.ref] = inputObj.inputRef;
    },
    refs: {}
  };

  this.handleKeyDown = function(e) {
    // enter key pressed
    if (e.charCode === 13) {
      self.saveUser();
    }
  };

  this.handleDateChange = function(value, modifier, dayPickerInput) {
    console.log('*** date value = ' + value);
    console.log('*** dayPickerInput value = ' + dayPickerInput.getInput().value);
    //console.log(typeof value);
    //console.log(new Date(value).getTime());

    if (typeof value !== 'undefined') {
      //console.log('*** date value = ' + value);
      self.dob = dayPickerInput.getInput().value;
    }
  };

  this.checkEmail = function() {
    // get browser to display any email error

    if (!controller.EditUser.refs || !controller.EditUser.refs.email) {
      return;
    }

    var valid = true;
    if (typeof controller.EditUser.refs.email.reportValidity === 'function') {
      valid = controller.EditUser.refs.email.reportValidity();
    }

    if (valid) {/* nothing in this instance */}
  };

  this.saveUser = function() {

    var id = self.props.data.id || '';

    if (typeof self.email !== 'string' || self.email === '') {
      controller.displayError('You must enter an Email Address');
      return;
    }

    if (typeof self.firstName !== 'string' || self.firstName === '') {
      controller.displayError('You must enter a First Name');
      return;
    }

    if (typeof self.lastName !== 'string' || self.lastName === '') {
      controller.displayError('You must enter a Last Name');
      return;
    }

    if (typeof self.nhsNumber === 'undefined' || self.nhsNumber === '') {
      controller.displayError('You must enter an NHS Number');
      return;
    }

    if (typeof self.dob === 'undefined' || self.dob === '') {
      controller.displayError('You must enter a Date of Birth');
      return;
    }

    if (typeof self.mobileNumber == 'undefined' || self.mobileNumber === '') {
      controller.displayError('You must enter a Mobile Number');
      return;
    }

    // send save message
    //   response handlersubscription - on('saveUser') - is in parent component (UserMaint)

    controller.send({
      type: 'saveUser',
      params: {
        id: id,
        email: self.email,
        username: self.username,
        firstName: self.firstName,
        lastName: self.lastName,
        dob: self.dob,
        nhsNumber: self.nhsNumber,
        mobileNumber: self.mobileNumber,
      }
    });

  };

  return controller;
};
