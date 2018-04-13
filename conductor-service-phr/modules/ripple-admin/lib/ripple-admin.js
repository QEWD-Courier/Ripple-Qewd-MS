/*

 ----------------------------------------------------------------------------
 | ripple-admin: Ripple User Administration MicroService                    |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  22 February 2018

*/

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
