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

  17 July 2018

*/


function parseWebTemplate(templateObj, platform) {
  var path = [];
  var info = [];
  var tree;

  if (platform === 'marand') {
    tree = templateObj.webTemplate.tree;
  }
  else {
    tree = templateObj.tree;
  }
  parse(tree.children, path, info, platform, tree.id);
  return {
    template_name: tree.name,
    composition_name: tree.node_id,
    metadata: info
  };
}

function removePunctuation(string) {
  if (string.indexOf('__') !== -1) string = string.split('__').join('_');
  return string.replace(/[.,\/#!$%\^&\*;:?{}=`~()]/g,"");
}

function parse(obj, path, info, platform, flatJSONPath) {
  console.log('\n path = ' + JSON.stringify(path) + '\n');

  obj.forEach(function(node, index) {
    console.log('&& parseWebTemplate obj.forEach: node.id = ' + node.id + '; index = ' + index);
    console.log('&& aql_path = ' + node.aql_path);

    var currentPath = path.slice(0);
    var newFlatJSONPath = flatJSONPath;

    if (typeof node.id === 'undefined') {
      if (node.children) {
        console.log('\n** nodeId undefined; parsing children');
        //if (!tree_structure && node.max === -1) flatJSONPath = flatJSONPath + ':0';
        parse(node.children, currentPath, info, platform, newFlatJSONPath);
        console.log('!! finished processing children for ' + currentPath + ' (nodeId undefined)\n');
      }
      else {
        console.log('** node.id undefined but no children - ignore?');
        console.log('type = ' + node.type + '; category = ' + node.category);
      }
    }
    else {
      var nodeId = removePunctuation(node.id);
      var tree_structure = false;
      if (node.type === 'ITEM_TREE' && (node.id === 'tree' || node.id === 'structure' || node.id === 'list')) tree_structure = true;
      if (node.type === 'HISTORY' && node.id === 'event_series') tree_structure = true;
      if (node.type === 'POINT_EVENT') tree_structure = true;
      if (node.type === 'HISTORY' && node.category === 'DATA_STRUCTURE') tree_structure = true;
      if (node.type === 'EVENT' && node.category === 'DATA_STRUCTURE') tree_structure = true;

      if (!tree_structure) {
        currentPath.push(nodeId);
        newFlatJSONPath = newFlatJSONPath + '/' + nodeId;
      }
      if (node.children) {
        console.log('\n** nodeId: ' + nodeId + '; parsing children');
        if (!tree_structure && node.max === -1) newFlatJSONPath = newFlatJSONPath + ':0';
        parse(node.children, currentPath, info, platform, newFlatJSONPath);
        console.log('!! finished processing children for ' + nodeId + '\n');
      }
      else {
        console.log('\n** nodeId: ' + nodeId + '; no children, so working on this node');

        if (!tree_structure && node.max === -1) newFlatJSONPath = newFlatJSONPath + ':0';

        var pieces;
        var aqlPath;
        if (platform === 'marand') {
          aqlPath = node.aqlPath;
        }
        else {
          //console.log('node = ' + JSON.stringify(node));
          aqlPath = node.aql_path;
        }
        pieces = aqlPath.split('/');
        var newPath = [];
        pieces.forEach(function(piece) {
          if (piece.indexOf('[at') !== -1) {
            var pcs = piece.split('[');
            var val = pcs[1].split(']')[0];
            if (val.indexOf(",") !== -1) val = val.split(',')[0];
            newPath.push(pcs[0] + '[' + val + ']');
          }
          else {
            newPath.push(piece);
          }
        });

        newPath.shift();       // remove first item
        if (platform === 'marand') newPath.splice(-1, 1); // remove last item

        var required = false;
        var max;
        var min;
        var type;
        var codes;

        console.log('parseTemplate: node = ' + JSON.stringify(node, null, 2) + '\n');

        if (platform === 'marand') {
          max = node.max;
          if (node.min > 0) required = true;
          type = node.rmType;
        }
        else {
          max = 0;
          min = node.min;
          type = node.type;
          if (node.constraints) {
            if (node.constraints[0]) {
              if (node.constraints[0].constraint) {
                var occurrence = node.constraints[0].constraint.occurrence;
                if (occurrence) {
                  if (typeof min === 'undefined' && occurrence.min) min = occurrence.min;
                  if (occurrence.max) max = occurrence.max;
                }
              }
              if (node.constraints[0].type) type = node.constraints[0].type;
              if (node.constraints[0].constraint.defining_code) {
                codes = node.constraints[0].constraint.defining_code;
              }
            }
          }
          if (min > 0) required = true;
        }
        info.push({
          id: nodeId,
          name: node.name,
          path: currentPath,
          type: type,
          aqlPath: aqlPath,
          pathArr: newPath,
          required: required,
          max: max,
          codes: codes,
          flatJSONPath: newFlatJSONPath
        });
      }
    }
  });
}

module.exports = parseWebTemplate;
