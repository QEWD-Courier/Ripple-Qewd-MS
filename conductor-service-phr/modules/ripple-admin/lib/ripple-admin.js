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

  17 July 2018

*/

var request = require('request');
var headingData = {};

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

function postHeading(patientId, heading, data, jwt, callback) {
  var url = 'http://';
  if (this.userDefined.config.ssl) url = 'https://';
  url = url + 'localhost';
  if (this.userDefined.config.port && this.userDefined.config.port !== 80) {
    url = url + ':' + this.userDefined.config.port;
  }
  url = url + '/api/patients/' + patientId + '/' + heading;

  var options = {
    url: url,
    method: 'POST',
    json: true,
    qs: {
      format: 'openehr-jumper'
    },
    body: data,
    headers: {
      Authorization: 'Bearer ' + jwt
    }
  };
  request(options, function(error, response, body) {
    callback(error, response, body);
  });
}

function getHeadingSummary(patientId, heading, jwt, callback) {
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
      Authorization: 'Bearer ' + jwt
    }
  };

  request(options, function(error, response, body) {
    callback(error, response, body);
  });
}

function populatePatient(patientId, heading, jwt, finished) {
  if (!headingData[heading]) {
    headingData[heading] = require('../data/' + heading + '.json');
  }
  var self = this;
  var max = headingData[heading].length;
  var count = 0;
  headingData[heading].forEach(function(data) {
    postHeading.call(self, patientId, heading, data, jwt, function(error, response, body) {
      count++;
      if (count === max) {
        getHeadingSummary.call(self, patientId, heading, jwt, function(error, response, body) {
          if (error) {
            return finished(error);
          }
          if (!Array.isArray(body)) {
            return finished({error: 'Invalid response from CDR service'});
          }
          finished(body);
        });
      }
    });
  });
}


module.exports = {

  beforeHandler: function(messageObj, session, send, finished) {
    if (messageObj.type === 'loggedIn') return;
    if (messageObj.type === 'getHomePageURLs') return;
    if (!session.authenticated) {
      finished({error: 'User MUST be authenticated'});
      return false;
    }
  },

  handlers: {

    loggedIn: function(messageObj, session, send, finished) {
      var validJWT = this.jwt.handlers.isJWTValid.call(this, messageObj.params.jwt);
      if (validJWT.ok) {
        session.timeout = 20 * 60;
        session.updateExpiry();
        session.authenticated = true;
        finished({ok: true}); 
      }
      else {
        session.timeout = 1;
        session.updateExpiry();
        session.authenticated = false;
        finished({ok: false}); 
      }
    },

    deleteHeading: function(messageObj, session, send, finished) {

      var validJWT = this.jwt.handlers.isJWTValid.call(this, messageObj.params.jwt);

      if (validJWT.ok) {

        var patientId = messageObj.params.patientId;
        var heading = messageObj.params.heading;

        // send REST request to get summary for this heading

        var self = this;
        var jwt = messageObj.params.jwt;

        getHeadingSummary.call(this, patientId, heading, jwt, function(error, response, body) {
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
    },

    populatePatient: function(messageObj, session, send, finished) {
      var params = messageObj.params;
      if (!params.patientId || params.patientId === '') {
        return finished({error: 'Patient Id not defined or empty string'});
      }
      if (!params.heading || params.heading === '') {
        return finished({error: 'Heading not defined or empty string'});
      }
      // first fetch the heading summary for this patient / heading to ensure there's
      //  no errors and that there's no data

      var self = this;
      var jwt = messageObj.params.jwt;
      getHeadingSummary.call(this, params.patientId, params.heading, jwt, function(error, response, body) {
        if (error) {
          return finished(error);
        }
        if (!Array.isArray(body)) {
          return finished({error: 'Invalid response from CDR service'});
        }
        if (body.length > 0) {
          return finished({error: 'Patient ' + params.patientId + ' already has ' + params.heading + ' data'});
        }
        populatePatient.call(self, params.patientId, params.heading, jwt, finished);
      });
    }
  }
};
