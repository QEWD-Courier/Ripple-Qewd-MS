
module.exports = function(args, finished) {
  var session = args.session;
  session.authenticated = false;
  var url = this.oauth.getRedirectURL();

  finished({
    redirectURL: url
  });
};