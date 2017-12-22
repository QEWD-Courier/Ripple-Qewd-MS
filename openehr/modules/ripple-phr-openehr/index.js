var router = require('qewd-router');

var getHeading = require('./handlers/getHeading');

var routes = {
  '/phr/my/heading/:heading': {
    GET: getHeading
  }
};

module.exports = {
  init: function() {
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function(req, finished) {
    var authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorised) {
      var sub = req.session.verify_jwt.sub;
      var qewdSession = this.sessions.byToken(sub);
      if (!qewdSession) {
        // New Verify JWT - need to create a new QEWD Session for it

        //console.log('**** application: ' + req.application + '; timeout: ' + req.session.timeout);
        qewdSession= this.sessions.create(req.application, req.session.timeout);
        var token = qewdSession.token;

        // swap QEWD Session token with JWT sub value
        var sessionGlo = this.db.use('CacheTempEWDSession');
        var sessionRec = sessionGlo.$(['session', qewdSession.id]);
        var sessionIndex = sessionGlo.$('sessionsByToken');
        sessionRec.$(['ewd-session', 'token']).value = sub;
        sessionIndex.$(sub).value = qewdSession.id;
        sessionIndex.$(token).delete();
        console.log('**** new QEWD Session created for sub ' + sub);

      }
      else {
        console.log('QEWD Session ' + qewdSession.id + ' exists for sub ' + sub);
      }
      req.qewdSession = qewdSession;
    }
    return authorised;
  }
};