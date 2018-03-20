var config = require('./startup_config.json');
var ms_hosts = require('./ms_hosts.json');
var ms_routes = require('./ms_routes.json');
var local_routes = require('./local_routes.json');
config.jwt = require('./jwt_secret.json');
var ms_config = require('./ms_config');
var customiseRoutes = require('./customiseRoutes');

config.u_services = ms_config(ms_routes, ms_hosts);
var routes = customiseRoutes(local_routes, config);

config.moduleMap = {
  'ripple-admin': '/opt/qewd/mapped/modules/ripple-admin'
};

var userDefined = require('./userDefined.json');

function onStarted() {

  var now = Math.floor(Date.now()/1000);
  var timeout = this.userDefined.config.initialSessionTimeout;

  var payload = {
    exp: now + timeout,
    iat: now,
    iss: 'qewd.jwt',
    application: 'ripple-openehr-jumper',
    qewd: {authenticated: true},
    timeout: timeout,
    userMode: 'primary_startup'
  };
  var jwt = this.jwt.handlers.updateJWT.call(this, payload);
  console.log('jwt = ' + jwt);

  // now send a build request to openehr microservice

  var message = {
    path: '/api/openehr/jumper/build',
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + jwt
    }
  };
  this.microServiceRouter(message, function(response) {
    console.log('** microService response: ' + JSON.stringify(response));
  });


}

module.exports = {
  config: config,
  routes: routes,
  userDefined: userDefined,
  onStarted: onStarted
};
