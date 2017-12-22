var router = require('qewd-router');
var routes = require('./routeGenerator');

module.exports = {
  restModule: true,
  init: function() {
    routes = router.initialise(routes, module.exports);
  },
  workerResponseHandlers: {
    initialise: function(message) {

      var client;
      for (var url in this.u_services.clients) {
        client = this.u_services.clients[url];
        client.send({
          type: 'test',
          hello: 'from primary',
          token: client.token
        });
      }

      console.log('*** initialise worker response handler: ' + JSON.stringify(message));
      return {hello: 'world'};
    }
  }
};