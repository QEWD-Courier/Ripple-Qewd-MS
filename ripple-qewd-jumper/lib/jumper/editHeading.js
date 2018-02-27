var ask = require('readline-sync');
var path = require('path');

var buildRippleToOpenEHR = require('./buildRippleToOpenEHR');
var buildFHIRToOpenEHR = require('./buildFHIRToOpenEHR');

function editHeading(headingName, folderName, jumperPath) {
  console.log('Editing ' + headingName + '; folder: ' + folderName + '; jumperPath: ' + jumperPath);

  var createInverse = ask.keyInYNStrict('Do you want to automatically create reverse templates for transforming Ripple UI and FHIR to OpenEHR Format?');

  var headingPath = path.join(jumperPath, folderName);

  if (createInverse) {
    buildRippleToOpenEHR(headingPath);
    buildFHIRToOpenEHR(headingPath);
  }

}

module.exports = editHeading;