var path = require('path');
var fs = require('fs-extra');
var ripplePath = require.resolve('qewd-ripple');
var pieces = ripplePath.split(path.sep);
pieces.splice(-1, 1); // remove filename from path
pieces.push('lib');
pieces.push('jumper');
var jumperPath = pieces.join(path.sep) + path.sep;

var ask = require('readline-sync');

var buildPackageJson = require('./jumper/buildPackageJson');
var buildHelpers = require('./jumper/buildHelpers');
var buildHeadings = require('./jumper/buildHeadings');
var buildIndex = require('./jumper/buildIndex');
var editHeading = require('./jumper/editHeading');
var newHeading = require('./jumper/newHeading');

function run() {

  console.log('*********************************');
  console.log('***** Ripple-QEWD Jumper  *******');
  console.log('*********************************');
  console.log('                                 ');
  console.log('This allows you to interactively ');
  console.log('build out and maintain the       ');
  console.log('/lib/jumper folder within your   ');
  console.log('Ripple-QEWD system.              ');
  console.log('                                 ');

  var headingsEmpty;

  if (!fs.existsSync(jumperPath + 'package.json')) {
    console.log('not yet set up, so build from scratch');
    buildHelpers(jumperPath);
    buildPackageJson('ripple-qewd-jumper-headings', jumperPath);
    buildHeadings(jumperPath);
    buildIndex(jumperPath);
    headings = {};
    headingsEmpty = true;
  }
  else {
    headings = require(jumperPath).map;
    if (headings.empty) {
      headings = {};
      headingsEmpty = true;
    }
    else {
      headingsEmpty = false;
    }
  }

  var addHeading = false;

  if (headingsEmpty) {
    console.log('*** No Headings currently defined ***');
    addHeading = true;    
  }
  else {
    var name;
    var headingList = [];
    console.log('Existing headings:');
    for (name in headings) {
      console.log(name);
      headingList.push(name);
    }
    do {
      console.log('***********');
      console.log('   ');
      console.log('Select the heading you wish to edit, or select CANCEL: ');
      var headingIndex = ask.keyInSelect(headingList, 'Heading: ', {
        cancel: true
      });
      if (headingIndex !== -1) {
        console.log('headingIndex = ' + headingIndex);
        var headingName = headingList[headingIndex];
        console.log('*** Editing ' + headingName);
        editHeading(headingName, headings[headingName], jumperPath);
      }
    }
    while (headingIndex !== -1);
    addHeading = ask.keyInYNStrict('Do you want to add a new Heading?');
  }



  if (addHeading) {
    console.log('** adding a new heading');
    newHeading(jumperPath, headings);
  }


}

module.exports = run;




