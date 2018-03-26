/*

 ----------------------------------------------------------------------------
 | ripple-openehr-jumper: Automated OpenEHR Template Access                 |
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

  21 March 2018

*/

var fs = require('fs-extra');
var buildFile = require('./buildFile');
var buildHeadingFHIRTemplate = require('./buildHeadingFHIRTemplate');
var buildHeadingRippleTemplate = require('./buildHeadingRippleTemplate');
var buildJSONFile = require('./buildJsonFile');
var getWebTemplate = require('./getWebTemplate');

function build(args, finished) {
  // check to see what headings need building out

  var templateName;
  var headingTemplate;
  var buildIt;
  var headingStatus;
  var headingPath;
  var fhirResourceName;

  var headings = this.userDefined.headings;

  var jumperHeadingPath = __dirname + '/../templates/';

  var headingsToBuild = {};
  var headingsBuilt = [];
  var noToBuild = 0;
  var heading;

  for (heading in headings) {
    headingTemplate = headings[heading].template;
    if (headingTemplate) {
      // should this heading be built / rebuilt?  or left alone?
      buildIt = false;
      headingPath = jumperHeadingPath + heading;
      templateName = headingTemplate.name; // OpenEHR Template Name
      // check build status of this template - has it already been created?

      if (!fs.existsSync(headingPath)) {
        console.log('heading ' + heading + ' template folder not yet created');
        buildIt = true;
      }
      else {
        console.log('heading ' + heading + ' template folder already created');
        if (!fs.existsSync(headingPath + '/headingStatus.json')) {
          // assume that this heading needs rebuilding
          buildIt = true;
        }
        else {
          headingStatus = require(headingPath + '/headingStatus.json');
          if (headingStatus.status === 'rebuild') buildIt = true;
        }
      }
      console.log('heading ' + heading + ': rebuild: ' + buildIt);
      if (buildIt) {
        noToBuild++;

        headingsToBuild[heading] = {
          headingPath: headingPath,
          templateName: templateName
        };
      }
    }
  }

  if (noToBuild === 0) {
    return finished({
      dirname: __dirname,
      headings_built: headingsBuilt
    });
  }

  var count = 0;
  var responseObj = {};
  var self = this;
  for (heading in headingsToBuild) {
    headingPath = headingsToBuild[heading].headingPath;
    templateName = headingsToBuild[heading].templateName;

    // build out and create the Jumper files and data for this heading
    buildHeadingRippleTemplate(headingPath);
    if (headings[heading].fhir && headings[heading].fhir.name) {
      fhirResourceName = headings[heading].fhir.name;
      buildHeadingFHIRTemplate(fhirResourceName, headingPath);
    }
    statusJson = {status: 'locked'};
    buildJSONFile.call(this, statusJson, headingPath, 'headingStatus.json');
    fs.chmodSync(headingPath, '0777');
    headingsBuilt.push(heading);
    // now fetch the Web Template from EtherCIS for this heading

    (function(heading, templateName, headingPath) {

      getWebTemplate.call(self, templateName, headingPath, function(response) {
        responseObj[heading] = response;
        count++;
        if (count == noToBuild) {
          finished({
            response: responseObj,
            headings_built: headingsBuilt
          });
        }
      });
    }(heading, templateName, headingPath));
  }
}

module.exports = build;
