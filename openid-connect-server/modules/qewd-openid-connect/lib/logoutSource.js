/*

 ----------------------------------------------------------------------------
 | qewd-openid-connect: QEWD-enabled OpenId Connect Server                  |
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

  4 July 2018

*/

module.exports = async function(ctx, form) {

  //console.log('&& logoutSource - this = ' + util.inspect(this));

  ctx.body = `
    <!DOCTYPE html>
    <head>
      <title>Logout</title>
    </head>
    <body>
      ${form}
      <script>
        var form = document.forms[0];
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'logout';
        input.value = 'yes';

        form.appendChild(input);

        form.submit();
      </script>
    </body>
  </html>`;
};
