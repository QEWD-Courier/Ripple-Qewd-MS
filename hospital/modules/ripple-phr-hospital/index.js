var router = require('qewd-router');
var loadPatients = require('./data/loadPatients');

var getDemographics = require('./handlers/getDemographics');

var routes = {
  '/phr/my/demographics': {
    GET: getDemographics
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
    loadPatients.call(this);
  },

  beforeMicroServiceHandler: function(req, finished) {
    return this.jwt.handlers.validateRestRequest.call(this, req, finished);
  }
};