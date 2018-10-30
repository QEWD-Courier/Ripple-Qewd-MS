/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  30 October 2018

*/

/*

Create new feed record

  POST /api/feeds

{
  "author": "ivor.cox@phr.leeds.nhs",
  "name": "BBC News",
  "landingPageUrl": "https://www.bbc.co.uk/news",
  "rssFeedUrl": "https://www.bbc.co.uk/rss",
}

*/

var uuid = require('uuid/v4');
var test = require('valid-url');

function post(args, finished) {

  var email = args.session.email;
  var payload = args.req.body;
  
  if (!payload.author || payload.author === '') {
    return finished({error: 'Author missing or empty'});
  }

  if (!payload.name || payload.name === '') {
    return finished({error: 'Feed name missing or empty'});
  }

  if (!payload.landingPageUrl || payload.landingPageUrl === '') {
    return finished({error: 'Landing page URL missing or empty'});
  }

  if (!test.isWebUri(payload.landingPageUrl)) {
    return finished({error: 'Landing page URL is invalid'});
  }

  if (!payload.rssFeedUrl || payload.rssFeedUrl === '') {
    return finished({error: 'RSS Feed URL missing or empty'});
  }

  if (!test.isWebUri(payload.rssFeedUrl)) {
    return finished({error: 'RSS Feed URL is invalid'});
  }

  // create a sourceId uuid
  var newSourceId = uuid();

  var doc = this.db.use('PHRFeeds');
  var feedsByEmailDoc = doc.$(['byEmail', email]);
  var feedsBySourceId = doc.$('bySourceId');
  var duplicateFound = false;

  // check for duplicates already saved against this user (email)

  if (feedsByEmailDoc.exists) {
    console.log('&& feeds exist');
    feedsByEmailDoc.forEachChild(function(sourceId) {
      var data = feedsBySourceId.$(sourceId).getDocument();
      if (data.name === payload.name) {
        newSourceId = sourceId;
        duplicateFound = true;
        return true; // stop loop
      }
      if (data.landingPageUrl === payload.landingPageUrl) {
        newSourceId = sourceId;
        duplicateFound = true;
        return true; // stop loop
      }
    });
  }

  if (!duplicateFound) {
    payload.email = email;
    payload.sourceId = newSourceId;
    payload.dateCreated = new Date().getTime();

    feedsByEmailDoc.$(newSourceId).value = 'true';
    feedsBySourceId.$(newSourceId).setDocument(payload);
  }

  finished({sourceId: newSourceId});
}

module.exports = post;
