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

  15 June 2018

*/

var request = require('request');

function deleteHeadingRecord(patientId, heading, sourceId, jwt, callback) {

  // send REST request to delete this heading record

  var url = 'http://';
  if (this.userDefined.config.ssl) url = 'https://';
  url = url + 'localhost';
  if (this.userDefined.config.port && this.userDefined.config.port !== 80) {
    url = url + ':' + this.userDefined.config.port;
  }
  url = url + '/api/patients/' + patientId + '/' + heading + '/' + sourceId;

  var options = {
    url: url,
    method: 'DELETE',
    json: true,
    headers: {
      Authorization: 'Bearer ' + jwt
    }
  };

  request(options, function(error, response, body) {
    console.log('body = ' + JSON.stringify(body));
    callback(sourceId);
  });

  /*
  setTimeout(function() {
    callback(sourceId);
  }, 1000);
  */
}


module.exports = {

  handlers: {

    deleteHeading: function(messageObj, session, send, finished) {

      var validJWT = this.jwt.handlers.isJWTValid.call(this, messageObj.params.jwt);

      if (validJWT.ok) {

        var patientId = messageObj.params.patientId;
        var heading = messageObj.params.heading;

        // send REST request to get summary for this heading

        var url = 'http://';
        if (this.userDefined.config.ssl) url = 'https://';
        url = url + 'localhost';
        if (this.userDefined.config.port && this.userDefined.config.port !== 80) {
          url = url + ':' + this.userDefined.config.port;
        }
        url = url + '/api/patients/' + patientId + '/' + heading;

        var options = {
          url: url,
          method: 'GET',
          json: true,
          headers: {
            Authorization: 'Bearer ' + messageObj.params.jwt
          }
        };
        var self = this;

        request(options, function(error, response, body) {
          console.log('body = ' + JSON.stringify(body));

          var max = body.length;

          function deleteARecord(no) {
            var sourceId = body[no].sourceId;
            deleteHeadingRecord.call(self, patientId, heading, sourceId, messageObj.params.jwt, function(sourceId) {
              console.log('deleted ' + sourceId);
              send({deleted: sourceId});
              no++;
              console.log('no = ' + no + '; max = ' + max);
              if (no === max) {
                finished({records: max});
              }
              else {
                deleteARecord(no);
              }
            });
          }
          
          deleteARecord(0);

          //finished(body);
        });

      }
      else {
        finished({error: 'Invalid JWT'});
      }

    },

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
