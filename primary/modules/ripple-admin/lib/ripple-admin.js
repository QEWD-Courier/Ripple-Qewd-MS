//var bcrypt = require('bcrypt');

module.exports = {

  handlers: {

    getHomePageURLs: function(messageObj, session, send, finished) {
      var ripple = '';
      var phr = '';
      if (this.userDefined.ripple && this.userDefined.ripple.homepage) {
        ripple = this.userDefined.ripple.homepage;
      }

      if (this.userDefined.phr && this.userDefined.phr.homepage) {
        phr = this.userDefined.phr.homepage;
      }
      
      finished({
        ripple: ripple,
        phr: phr
      });
    }

    /*
    login: function(messageObj, session, send, finished) {
       
      var username = messageObj.params.username;
      if (!username || username === '') {
        return finished({error: 'You must enter a username'});
      }

      var password = messageObj.params.password;
      if (!password || password === '') {
        return finished({error: 'You must enter a password'});
      }
      var credentialsDoc = this.db.use('RippleAdmin', ['byUsername']);

      var userCredentials = credentialsDoc.$(username);
      if (!userCredentials.exists) {
        // username not recognised
        return finished({error: 'Invalid login attempt'});
      }
      if (digest(password) !== userCredentials.$('password').value) {
        // username ok but wrong password
        return finished({error: 'Invalid login attempt'});
      }
      session.timeout = 20 * 60;
      session.authenticated = true;
      finished({ok: true});
    }
    */
  }
};
