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

function setCookie(value, name) {
  name = name || 'JSESSIONID';
  document.cookie = name + "=" + value + '; path=/';
  console.log('cookie set to: ' + name + "=" + value + '; path=/');
};

module.exports = function (controller, component) {

  controller.log = true;

  controller.formFieldHandler = function(formModuleName, fieldName) {
    var self = this;
    this.controller[formModuleName] = {
      onFieldChange: function(inputObj) {
        console.log('FieldChange - ' + inputObj.ref + '; ' + inputObj.value);
        self[inputObj.ref] = inputObj.value;
        self.controller[formModuleName][fieldName] = inputObj.value;
      }
    };
    this.controller[formModuleName][fieldName] = '';
  };

  controller.toastr = function(type, text) {
    if (type && type !== '' && component.refs && component.refs.toastContainer && component.refs.toastContainer[type]) {
      component.refs.toastContainer[type](text);
    }
  };

  controller.displayError = function(error) {
    controller.toastr('error', error);
  };

  // display generic EWD.js errors using toastr:

  controller.on('error', function(messageObj) {
    console.log('&&& error event: messageObj = ' + JSON.stringify(messageObj));
    var error = messageObj.message.error || messageObj.message;
    controller.displayError(error);
  });

  // publish the login response handler in this
  // component to force re-render of main page

  controller.on('login', function(messageObj) {
    if (!messageObj.message.error && messageObj.message.ok) {
      // logged in

      component.showLoginModal = false;
      var status = messageObj.message.mode || 'loggedIn';

      controller.token = messageObj.message.token; // update JWT
      // create the JSESSIONID cookie to allow correct login of Ripple / LeedsPHR
      setCookie(controller.token);

      component.setState({
        status: status
      });
    }
  });


  controller.on('logout', function() {
    controller.disconnectSocket();
    component.setState({
      status: 'shutdown'
    });
  });

  /*
  controller.on('main', function() {
    component.setState({
      status: 'main'
    });
  });
  */

  component.navs = [
    {
      text: 'Main',
      eventKey: 'main',
      default: true,
      panel: {
        title: 'Main Panel'
      }
    }
  ];

  if (component.props.config && component.props.config.navs) {
    component.navs = component.props.config.navs
  }

  component.navs.forEach(function(nav) {
    controller.on(nav.eventKey, function() {
      component.setState({
        status: nav.eventKey
      });
    });
    if (!nav.text) nav.text = 'Unspecified';
    if (!nav.eventKey) nav.eventKey = 'unspecified';
    if (!nav.panel) nav.panel = {};
    if (!nav.panel.bsStyle) nav.panel.bsStyle = 'primary';
    if (!nav.panel.title) nav.panel.title = nav.text + ' Panel';
    if (!nav.panel.titleComponentClass) nav.panel.titleComponentClass = 'h3';
  });

  if (component.navs.length === 1) {
    if (!component.navs[0].default) component.navs[0].default = true;
  }

  controller.navOptionSelected = function(eventKey) {
    controller.emit(eventKey);
  };

  controller.app = component.props.config || {};
  if (!controller.app.navs) controller.app.navs = component.navs;
  if (!controller.app.title) controller.app.title = 'Un-named Application';

  if (controller.app.loginModal && controller.app.mode !== 'local') {
    component.showLoginModal = true;
  }
  else {
    component.showLoginModal = false;
    component.setState({
      status: 'loggedIn'
    });
  }

  component.checkAdminDoc = function() {
    console.log('Checking Admin Document Status....');

    controller.send({
      type: 'getHomePageURLs'
      }, function(responseObj) {
        console.log('getHomePageURLs response: ' + JSON.stringify(responseObj));

        controller.adminPortalURLs = responseObj.message;

        // now see if Admin Document has been created yet
        $.ajax({
          url: '/api/auth/admin/docStatus',
          method: 'GET',
          contentType: 'application/json',
          dataType: 'json',
          timeout: 10000
        })
        .done(function(data) {
          console.log('*** received response: ' + JSON.stringify(data));
          component.setState({
            status: data.status
          });
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
    });
  };

  component.hideUsername = false;

  component.startLogin = function() {
    if (component.state.status === 'docEmpty') component.hideUsername = true;
    component.setState({
      status: 'initial'
    });
  };


  return controller;
};
