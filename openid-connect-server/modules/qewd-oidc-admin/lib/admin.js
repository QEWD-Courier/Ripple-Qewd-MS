/*

 ----------------------------------------------------------------------------
 | qewd-oidc-admin: Administration Interface for QEWD OpenId Connect Server |
 |                                                                          |
 | Copyright (c) 2018 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

  02 October 2018

*/


module.exports = {
  handlers: {
    getAdminStatus: require('./handlers/getAdminStatus'),
    login: require('./handlers/login'),
    registerUser: require('./handlers/registerUser'),
    getClients: require('./handlers/getClients'),
    saveClient: require('./handlers/saveClient'),
    deleteClientRecord: require('./handlers/deleteClient'),
    getClaims: require('./handlers/getClaims'),
    saveClaim: require('./handlers/saveClaim'),
    deleteClaimRecord: require('./handlers/deleteClaim'),
    getUsers: require('./handlers/getUsers'),
    saveUser: require('./handlers/saveUser'),
    deleteUserRecord: require('./handlers/deleteUser'),
    getMaintainers: require('./handlers/getMaintainers'),
    saveMaintainer: require('./handlers/saveMaintainer'),
    deleteMaintainer: require('./handlers/deleteMaintainer'),
    sendEmail: require('./handlers/sendEmail'),
    confirmCode: require('./handlers/confirmCode'),
    changePassword: require('./handlers/changePassword'),
    resendCode: require('./handlers/resendCode')
  }
};
