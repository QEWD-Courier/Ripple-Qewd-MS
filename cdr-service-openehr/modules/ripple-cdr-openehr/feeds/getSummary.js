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

Feeds summary

  GET /api/feeds

*/

function getSummary(args, finished) {

  var email = args.session.email;

  var doc = this.db.use('PHRFeeds');
  var feedsByEmailDoc = doc.$(['byEmail', email]);
  var feedsBySourceId = doc.$('bySourceId');

  var names = {};
  var urls = {};
  var results = [];

  feedsByEmailDoc.forEachChild(function(sourceId) {
    var data = feedsBySourceId.$(sourceId).getDocument();
    if (names[data.name]) {
      // duplicate - delete it
      feedsByEmailDoc.$(sourceId).delete();
      feedsBySourceId.$(sourceId).delete();
      return;
    }

    if (urls[data.landingPageUrl]) {
      // duplicate found - delete it
      feedsByEmailDoc.$(sourceId).delete();
      feedsBySourceId.$(sourceId).delete();
      return;
    }

    names[data.name] = true;
    urls[data.landingPageUrl] = true;

    results.push({
      name: data.name,
      landingPageUrl: data.landingPageUrl,
      rssFeedUrl: data.rssFeedUrl,
      sourceId: sourceId
    });
  });

  finished({feeds: results});
}

module.exports = getSummary;
