var config = require('./startup_config.json');
var ms_hosts = require('./ms_hosts.json');
var ms_routes = require('./ms_routes.json');
var local_routes = require('./local_routes.json');
var secret = require('./jwt_secret.json');

config.jwt = secret;

config.u_services = {
  destinations: {
    authentication_service: {
      host: ms_hosts.authentication_service,
      application: 'ripple-oauth-openid'
    },
    hospital_service: {
      host: ms_hosts.hospital_service,
      application: 'ripple-phr-hospital'
    },
    phr_service: {
      host: ms_hosts.phr_service,
      application: 'ripple-phr-openehr'
    }
  },
  routes: ms_routes
};

var routes = local_routes;

module.exports = {
  config: config,
  routes: routes
};
