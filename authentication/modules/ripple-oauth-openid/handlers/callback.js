var jwt = require('jwt-simple');

module.exports = function(args, finished) {

  var callbackURL = this.oauth.config.callback_url;
  var self = this;
  this.oauth.client.authorizationCallback(callbackURL, args.req.query)
    .then(function (tokenSet) {

      var session = args.session;
      session.authenticated = true;
      session.timeout = tokenSet.refresh_expires_in;
      var verify_jwt = jwt.decode(tokenSet.id_token, null, true);
      session.nhsNumber = verify_jwt.nhsNumber;
      session.verify_jwt = verify_jwt;
      session.makeSecret('verify_jwt');

      // possibly use verify_jwt.sub as a key for a global or session record
      //  could use session and give it the same timeout as jwt

      finished({
        ok: true
        //tokenSet: tokenSet,
        //verify_jwt: verify_jwt
      });
  });



};