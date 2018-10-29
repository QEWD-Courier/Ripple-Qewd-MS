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

  18 September 2018

*/

module.exports = function(args, finished) {

  var jwt = args.session;
  var openid = jwt.openid;

  var role = 'PHR';
  var jwtRole = jwt.role;
  if (jwtRole !== 'phrUser') role = 'IDCR';  // may need changing

  var user = {
    sub: openid.sub,
    given_name: openid.firstName,
    family_name: openid.lastName,
    email: jwt.email,
    dateOfBirth: new Date(openid.dob).getTime(),
    tenant: '',
    role: role,
    roles: [role],
    nhsNumber: jwt.nhsNumber
  };

  finished(user);

};
