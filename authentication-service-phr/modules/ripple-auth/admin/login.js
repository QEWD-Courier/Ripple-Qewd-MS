/*

 ----------------------------------------------------------------------------
 | ripple-auth: Ripple Authentication MicroServices                         |
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

  21 Februry 2018

*/

var bcrypt = require('bcrypt');
var uuid = require('uuid/v4');

module.exports = function(args, finished) {

  if (args.req.body) {

    var adminDoc = this.db.use('RippleAdmin');
    if (!adminDoc.exists) {
      // allow login using QEWD Management Password, and then only allow
      // 1 admin user to be created

      // username can be ignored for this scenario

      if (args.req.body.password === this.userDefined.config.managementPassword) {
        args.session.userMode = 'addAdminUser';
        args.session.authenticated = true;
        return finished({
          ok: true,
          mode: 'addAdminUser',
        });
      }
      else {
        return finished({error: 'Invalid login attempt'});
      }

    }

    var username = args.req.body.username;
    if (typeof username !== 'string' || username === '') {
      return finished({error: 'You must enter a username'});
    }
    var password = args.req.body.password;
    if (typeof password !== 'string' || password === '') {
      return finished({error: 'You must enter a password'});
    }

    var adminDoc = this.db.use('RippleAdmin');
    var usernameIndex = adminDoc.$(['byUsername', username]);
    if (!usernameIndex.exists) {
      return finished({error: 'Invalid login attempt'});
    }
    var id = usernameIndex.value;
    var userDoc = adminDoc.$(['byId', id]);
    var user = userDoc.getDocument();
    var match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return finished({error: 'Invalid login attempt'});
    }
    args.session.userMode = user.type;

    // Put user details into JWT for return to browser,
    //  so they will control and appear in PulseTile's UK

    args.session.given_name = user.givenName;
    args.session.family_name = user.familyName;
    args.session.email = user.email;
    args.session.role = 'IDCR';
    args.session.roles = ['IDCR'];
    args.session.uid = uuid(); // used by OpenEHR machine as the session uid

    delete args.session.auth0;
    delete args.session.nhsNumber;

    args.session.authenticated = true;
    args.session.timeout = 1200;
    return finished({
      ok: true,
      mode: user.type
    });
  }

  finished({error: 'Invalid login attempt'});
 
};
