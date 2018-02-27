/*

 ----------------------------------------------------------------------------
 | qewd-content-store: Content store using semi-structured free text        |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
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

  7 February 2017

*/

module.exports = function (controller, component) {

  //component.show = component.props.data.show;
  //component.options = component.props.data.options;
  //component.prefix = component.props.data.prefix;

  component.userType = {
    value: 'idcr',
    options: [
      {
        value: 'idcr',
        label: 'IDCR'
      },
      {
        value: 'admin',
        label: 'Administrator'
      }
    ],
    change: function(selectedOption) {
      component.userType.value = selectedOption.value;
      component.setState({
        status: 'userTypeSelected'
      });
    }    
  };

  component.cancel = function() {
    controller.emit('cancelRegisterUser');
  };

  /*
  component.selectPhrase = function(option) {
    console.log('phrase selected: ' + JSON.stringify(option));
    controller.send({
      type: 'selectPhrase',
      params: {
        phrase: option.value
      }
    });
  };
  */

  controller.RegisterUser = {
    onFieldChange: function(inputObj) {
      console.log('onFieldChange - ' + inputObj.ref + '; ' + inputObj.value);
      component[inputObj.ref] = inputObj.value;

      /*
      if (inputObj.ref === 'username') {
        console.log('trigger search for ' + component.phrasePrefix);
        controller.send({
          type: 'getPhrasesByPrefix',
          params: {
            prefix: component.phrasePrefix
          }
        });
      }
      */

    }
  };

  component.handleKeyDown = function(e) {
    // enter key pressed
    if (e.charCode === 13) {
      component.handleSubmit();
    }
  };

  component.addUser = function() {
    console.log('username: ' + component.username);
    console.log('password: ' + component.password);
    console.log('password2: ' + component.password2);

    if (!component.username || component.username === '') {
      controller.displayError('You must enter a username');
      return;
    }

    if (!component.password || component.password === '') {
      controller.displayError('You must enter a password');
      return;
    }

    if (!component.password2 || component.password2 === '') {
      controller.displayError('You must re-enter the password');
      return;
    }

    if (component.password !== component.password2) {
      controller.displayError('Passwords must match!');
      return;
    }

    if (component.props.loginStatus === 'addAdminUser') {
      component.userType.value = 'admin';
    }

    if (!component.givenName || component.givenName === '') {
      controller.displayError('You must enter a First Name');
      return;
    }

    if (!component.familyName || component.familyName === '') {
      controller.displayError('You must enter a Last Name');
      return;
    }

    if (!component.email || component.email === '') {
      controller.displayError('You must enter a valid Email Address');
      return;
    }

    $.ajax({
      url: '/api/auth/admin/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        username: component.username,
        password: component.password,
        userType: component.userType.value,
        givenName: component.givenName,
        familyName: component.familyName,
        email: component.email,
      }),
      headers: {
        Authorization: 'Bearer ' + controller.token
      },
      dataType: 'json',
      timeout: 10000
    })
    .done(function(data) {
      console.log('*** received response: ' + JSON.stringify(data));
      controller.emit('registerUser', data);
    })
    .fail(function(err, textStatus, errorThrown) {
      console.log('*** registerUser err: ' + JSON.stringify(err));
      if (!err.responseJSON || !err.responseJSON.error) {
        controller.emit('error', {message: {error: 'Your request timed out'}});
      }
      else {
        controller.emit('error', {message: {error: err.responseJSON.error}});
      }
    });

  };

  controller.on('registerUser', function(messageObj) {
    console.log('registerUser event: ' + JSON.stringify(messageObj));
    controller.token = messageObj.token;
    var status = 'userAdded';
    if (component.props.loginStatus === 'addAdminUser') status = 'alert';
    controller.toastr('info', 'New User Registered Successfully');
    setTimeout(function() {
      component.setState({
        status: status
      });
    }, 500);
  });

  component.reload = function() {
    window.location = '/ripple-admin/index.html';
  };

  return controller;
};
