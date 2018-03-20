var config = require('./startup_config.json');
config.jwt = require('./jwt_secret.json');
var local_routes = require('./local_routes.json');

module.exports = {
  config: config,
  routes: local_routes
};

