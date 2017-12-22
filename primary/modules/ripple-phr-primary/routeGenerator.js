var routeDef = require('./routes.json');
var routes = [];
routeDef.forEach(function(route) {
  route.handler = require('./handlers/' + route.use);
  delete route.use;
   routes.push(route);
});
module.exports = routes;
