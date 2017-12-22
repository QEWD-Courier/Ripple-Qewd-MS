var router = require('qewd-router');
var oauth_openid = require('./oauth-openid');

var login = require('./handlers/login');
var callback = require('./handlers/callback');
var test = require('./handlers/test');

var routes = {
  '/phr/oauth/test': {
    GET: test
  },
  '/phr/oauth/login': {
    GET: login
  },
  '/phr/oauth/callback': {
    GET: callback
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
    oauth_openid.init.call(this);
  },

  beforeMicroServiceHandler: function(req, finished) {

    var checkIfAuthenticated = true;
    if (req.pathTemplate === '/phr/oauth/callback') {
      req.headers.authorization = 'Bearer ' + req.token;
      checkIfAuthenticated = false;
    }

    if (req.path !== '/phr/oauth/login') {
      return this.jwt.handlers.validateRestRequest.call(this, req, finished, true, checkIfAuthenticated);
    }
  }
};