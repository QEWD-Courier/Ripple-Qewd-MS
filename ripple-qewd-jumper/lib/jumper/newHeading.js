var ask = require('readline-sync');
var fs = require('fs-extra');
var path = require('path');
var buildJSONFile = require('./buildJsonFile');
var buildHeadingIndex = require('./buildHeadingIndex');
var buildHeadingFHIRTemplate = require('./buildHeadingFHIRTemplate');
var buildHeadingRippleTemplate = require('./buildHeadingRippleTemplate');

function newHeading(jumperPath, headings) {
  //console.log('Adding new heading; jumperPath: ' + jumperPath);

  var templateName = ask.question('OpenEHR Template Name: ', {});
  if (templateName === '') {
    console.log('Cancelled...');
    return;
  }

  var fhirResourceName = ask.question('FHIR Resource Name for this heading: ', {});
  var folderName = ask.question('Ripple Heading alias name (eg "allergies"): ', {});
  if (folderName === '') {
    newHeading(jumperPath);
    return;
  }

  var headingPath = path.join(jumperPath, folderName);
  if (fs.pathExistsSync(headingPath)) {
    console.log('*** Error: that heading alias is already in use');
    newHeading(jumperPath);
    return;
  }

  console.log('Adding template ' + templateName + '; folder ' + folderName);

  buildHeadingIndex(templateName, fhirResourceName, headingPath);
  buildHeadingFHIRTemplate(fhirResourceName, headingPath);
  buildHeadingRippleTemplate(headingPath);

  headings[templateName] = folderName;
  buildJSONFile(headings, jumperPath, 'headings.json')


}

module.exports = newHeading;