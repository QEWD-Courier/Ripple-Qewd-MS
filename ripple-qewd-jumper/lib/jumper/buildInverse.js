/*

 ----------------------------------------------------------------------------
 | qewd: Quick and Easy Web Development                                     |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.=|
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

  3 November 2017

*/

var buildJsonFile = require('./buildJsonFile');
var path = require('path');
var traverse = require('traverse');
var helpers;

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function pathToRef(pathArr) {
  var dot = '';
  var ref = '';
  pathArr.forEach(function(path) {
    if (isNumeric(path)) {
      ref = ref + '[' + path + ']';
    }
    else {
      ref = ref + dot + path; 
    }
    dot = '.';
  });
  return ref;
}

function createInversePath(sourcePath, rippleToOpenEHR, value) {
  console.log('createInversePath: sourcePath = ' + sourcePath);
  console.log('type: ' + typeof sourcePath);
  var pieces = sourcePath.split('.');
  var obj = rippleToOpenEHR;
  var max = pieces.length;
  var count = 0;
  pieces.forEach(function(property) {
    if (!obj[property]) obj[property] = {};
    count++;
    if (count === max) {
      obj[property] = value;
    }
    obj = obj[property];
  });
}

module.exports = function(sourceJSONFile, inverseJSONFile, jumperPath) {

  try {
    helpers = require('qewd-ripple/lib/jumper').helpers;
  }
  catch(err) {}

  var filePath = path.join(jumperPath, sourceJSONFile);
  var openEHRPath;
  var rippleToOpenEHR = {};
  var obj;
  var pieces;
  var max;
  var count;

  console.log('in buildInverse with filePath = ' + filePath);
  var json = require(filePath);
  console.log('json = ' + JSON.stringify(json));

  traverse(json).map(function(node) {
    var value;
    var prefix;
    var pieces;
    if (!this.isLeaf) return;
    var name = this.key;

    console.log('name: ' + name);
    //openEHRPath = json[name];
    openEHRPath = node;
    console.log('openEHRPath = ' + openEHRPath);
    console.log('path: ' + JSON.stringify(this.path) + ': ' + pathToRef(this.path));
    var pathArr = this.path;
    if (openEHRPath.indexOf('{{') !== -1) {
      pieces = openEHRPath.split('{{');
      prefix = pieces[0];
      openEHRPath = pieces[1];
      openEHRPath = openEHRPath.split('}}')[0];
      if (prefix === '') {
        value = '{{' + pathToRef(pathArr) + '}}';
      }
      else {
        value = '=> removePrefix(' + pathToRef(pathArr) + ', \'' + prefix + '\')';
      }
      createInversePath(openEHRPath, rippleToOpenEHR, value)
    }
    else if (openEHRPath.substring(0, 2) === '=>') {
      var fn = openEHRPath.split('=> ')[1];
      pieces = fn.split('(');
      fn = pieces[0];
      var args = pieces[1].split(')')[0];
      args = args.split(',');
      args.forEach(function(arg, index) {
        args[index] = arg.trim();
        if (args[index] === 'true') args[index] = true;
        if (args[index] === 'false') args[index] = false;
      });
      var sourcePath = args[0];
      console.log('fn = ' + fn);
      console.log('sourcePath = ' + sourcePath + '; pieces = ' + JSON.stringify(pieces));
     
      if (helpers && helpers[fn]) {
        console.log('** args = ' + JSON.stringify(args));
        console.log('** last arg = ' + args[args.length - 1]);
        args[args.length - 1] = !args[args.length - 1];
        args[0] = pathToRef(pathArr);
        console.log('** args now = ' + JSON.stringify(args));
        value = '=> ' + fn + '(' + args.join(',') + ')';
        sourcePath = sourcePath.split(',')[0];
        createInversePath(sourcePath, rippleToOpenEHR, value)  
      }

      else if (fn === 'getDate') {
        value = '=> getTime(' + pathToRef(pathArr) + ')';
        createInversePath(sourcePath, rippleToOpenEHR, value)      
      }
    }
  });

  buildJsonFile(rippleToOpenEHR, jumperPath, inverseJSONFile);
};
