var config = require('./startup_config.json');
config.jwt = require('./jwt_secret.json');
var local_routes = require('./local_routes.json');
var userDefined = require('./userDefined.json');


function onStarted() {
  //var jumper = require('./modules/ripple-openehr-jumper');
  //jumper.build.call(this, userDefined.headings);

  var now = Math.floor(Date.now()/1000);
  var timeout = this.userDefined.config.initialSessionTimeout;

  var payload = {
    exp: now + timeout,
    iat: now,
    iss: 'qewd.jwt',
    application: 'ripple-openehr-jumper',
    qewd: {authenticated: true},
    timeout: timeout,
    userMode: 'openehr_startup'
  };
  var jwt = this.jwt.handlers.updateJWT.call(this, payload);

  var message = {
    application: "ripple-openehr-jumper",
    type: "restRequest",
    path: "/api/openehr/jumper/build",
    pathTemplate: "/api/openehr/jumper/build",
    method: "GET",
    token: jwt,
    headers: {
      authorization: 'Bearer ' + jwt
    },
    jwt: true
  };

  this.handleMessage(message, function(response) {
    console.log('*** onStarted response: ' + JSON.stringify(response));
  });

}

module.exports = {
  config: config,
  routes: local_routes,
  onStarted: onStarted
};

