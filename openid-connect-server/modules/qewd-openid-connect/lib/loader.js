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

const Provider = require('/opt/qewd/node_modules/oidc-provider');
const account = require('./account');
const adapter = require('./adapter');
const logoutSource = require('./logoutSource');

var path = require('path');
var util = require('util');

module.exports = function(app, bodyParser, params) {

  var qewd_adapter = adapter(this);
  var Account = account(this);

  const configuration = {
    claims: params.Claims,
    findById: Account.findById,

    interactionUrl(ctx) {
      return `/interaction/${ctx.oidc.uuid}`;
    },

    logoutSource: logoutSource,

    features: {
      devInteractions: false,
      sessionManagement: true
    }
  };

  if (params.cookies) {
    configuration.cookies = params.cookies;
  }
  if (!configuration.cookies) configuration.cookies = {};
  if (!configuration.cookies.keys) {
    configuration.cookies.keys = ['mySecret1', 'mySecret2', 'mySecret3'];
  }
  if (!configuration.cookies.thirdPartyCheckUrl) {
    configuration.cookies.thirdPartyCheckUrl = 'https://cdn.rawgit.com/panva/3rdpartycookiecheck/92fead3f/start.html';
  }

  if (params.postLogoutRedirectUri) {

    console.log('loading postLogoutRedirectUri: ' + params.postLogoutRedirectUri)

    async function postLogoutRedirectUri(ctx) {
      console.log('postLogoutRedirectUri function returning ' + params.postLogoutRedirectUri);
      return params.postLogoutRedirectUri;
    }

    configuration.postLogoutRedirectUri = postLogoutRedirectUri;
  }

  var issuer = params.issuer.host;
  if (params.issuer.port) issuer = issuer + ':' + params.issuer.port;
  issuer = issuer + '/openid';

  const oidc = new Provider(issuer, configuration);

  oidc.initialize({
    keystore: params.keystore,
    adapter: qewd_adapter
  }).then(() => {

    app.set('trust proxy', true);
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, 'views'));

    const parse = bodyParser.urlencoded({ extended: false });

    app.get('/interaction/logout', async (req, res) => {
      //console.log('*** logout redirection page');
      res.render('logout');
    });

    app.get('/interaction/:grant', async (req, res) => {
      oidc.interactionDetails(req).then((details) => {
        console.log('see what else is available to you for interaction views', details);

        const view = (() => {
          switch (details.interaction.reason) {
            case 'consent_prompt':
            case 'client_not_authorized':
            return 'interaction';
            default:
            return 'login';
          }
        })();

        res.render(view, { details });
      });
    });

    app.post('/interaction/:grant/confirm', parse, (req, res) => {
      oidc.interactionFinished(req, res, {
        consent: {},
      });
    });

    app.post('/interaction/:grant/login', parse, (req, res, next) => {
      console.log('*** interaction login function');
      console.log('req = ' + util.inspect(req));
      Account.authenticate(req.body.email, req.body.password).then((account) => {
        if (account.error) {
          var details = {
            params: {
              error: account.error
            },
            uuid: req.params.grant
          };
          res.render('login', {details});
          return;
        }

        console.log('** account: ' + JSON.stringify(account));
        oidc.interactionFinished(req, res, {
          login: {
            account: account.accountId,
            acr: '1',
            remember: !!req.body.remember,
            ts: Math.floor(Date.now() / 1000),
          },
          consent: {
            // TODO: remove offline_access from scopes if remember is not checked
          },
        });
      }).catch(next);
    });


    app.use('/openid', oidc.callback);
  });

  var self = this;
  var keepAliveTimer = setInterval(function() {
    self.send_promise({
      type: 'keepAlive'
    });
  }, 1000000);

  this.on('stop', function() {
    console.log('Stopping keepAliveTimer');
    clearInterval(keepAliveTimer);
  });

};
