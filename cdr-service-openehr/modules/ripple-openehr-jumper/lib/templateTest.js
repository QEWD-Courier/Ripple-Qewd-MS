var parseWebTemplate = require('ripple-openehr-jumper/lib/parseWebTemplate');
var createFlatJSON = require('ripple-openehr-jumper/lib/createFlatJSON');

var patientId = 9999999000;
var host = 'ethercis';

var dataSource='marand'; // ****

var dataSource = dataSource || host;

//var heading = "vaccinations";
var heading = "allergies";
//var heading = "problems";
//var heading = "contacts";
//var heading = "medications";
var log = false;
var log = true;

var metaDataOnly = false;
var metaDataOnly = true;

var flatJSONOnly = false;
var flatJSONOnly = true;

var headingRootPath = 'ripple-openehr-jumper/templates/';
var headingPath = headingRootPath + heading + '/';
var webTemplatePath = headingPath + 'WebTemplate_' + host + '.json';
var dataFilePath = headingPath + 'patient_data_raw_example_' + dataSource + '.json';
var data = require(dataFilePath);
var webTemplate = require(webTemplatePath);

function isEmpty(obj) {
  for (var index in obj) {
    return false;
  }
  return true;
}

function getByAQLPath(data, fieldInfo) {
  var subTree = data;
  var path;
  var fullPath;
  var found = true;
  var pathArr = fieldInfo.pathArr;
  var archetypeNodeId;
  for (var i = 0; i < pathArr.length; i++) {
      fullPath = pathArr[i];
      if (log) console.log('i = ' + i + '; fullPath = ' + fullPath);
      archetypeNodeId = false;
      var pieces;
      if (fullPath.indexOf('[') !== -1) {
        pieces = fullPath.split('[');
        archetypeNodeId = pieces[1].split(']')[0];
        path = pieces[0];
        if (log) console.log('** ' + path + ' : ' + archetypeNodeId);
      }
      else {
        path = fullPath;
      }
      subTree = subTree[path];
      if (subTree) {
        if (log) console.log('data found for path: ' + path);
        if (log) console.log('archetypeNodeId = ' + archetypeNodeId);
        if (archetypeNodeId) {
          if (Array.isArray(subTree)) {
            if (log) console.log('subTree is an array');
            var matching = [];
            subTree.forEach(function(tree) {
              if (log) console.log('tree.archetype_node_id = ' + tree.archetype_node_id);
              if (log) console.log('expecting ' + archetypeNodeId);
              if (tree.archetype_node_id === archetypeNodeId) {
                if (log) console.log('match found');
                matching.push(tree);
              }
            });
            if (matching.length === 0) {
              if (log) console.log('** no matching data found in array');
              found = false;
              break;
            }
            else {
              // just use first one for now
              if (log) console.log('** match found in array');
              subTree = matching[0];
            }
          }
          else {
           if (subTree.archetype_node_id !== archetypeNodeId) {
             if (log) console.log('archetype_node_id value of ' + archetypeNodeId + ' not found');
             found = false;
             break;
           }
          }
        }
        //if (log) console.log('subTree now ' + JSON.stringify(subTree, null, 2));
      }
      else {
        if (log) console.log('no data found for path ' + path);
        found = false;
        break;
      }
  }
  if (found) {
    if (log) console.log(fieldInfo.id + '; type: ' + fieldInfo.type);
    if (log) console.log('subTree: ' + JSON.stringify(subTree, null, 2));

    return subTree;
  }
  return;
}

var metadata = parseWebTemplate(webTemplate, host);

if (log) console.log('metadata = ' + JSON.stringify(metadata, null, 2));
if (log) console.log('=======================');
if (metaDataOnly) return;

var flatJSON = createFlatJSON(webTemplate);
if (flatJSONOnly) return;

var resultSet;

if (host === 'ethercis') {
  resultSet = data.resultSet;
}

var results = [];
resultSet.forEach(function(result, index) {
  if (log) console.log('\nExtracting data from result record ' + index);
  var data = result.data;

  var hc_facility = {};
  var context = data.context;
  if (context) {
    var hcf = context.health_care_facility;
    if  (hcf) {
      if (hcf.name) hc_facility.name = hcf.name;
      var extref = hcf.external_ref;
      if (extref) {
        if (extref.id) {
          hc_facility.id = {};
          if (extref.id.value) hc_facility.id.value = extref.id.value;
          if (extref.id.scheme) hc_facility.id.scheme = extref.id.scheme;
        }
        if (extref.namespace) hc_facility.id.namespace = extref.namespace;
      }
    }
  }

  var output = {
    uid: data.uid.value,
    health_care_facility: hc_facility,
    patientId: patientId,
    host: host
  };

  metadata.forEach(function(fieldInfo) {
    var parsedData = output;
    var aqlPath = fieldInfo.aqlPath;
    if (log) console.log('\n' + aqlPath);
    var fieldObj = getByAQLPath(data, fieldInfo);
    if (!fieldObj) return;

    //if (log) console.log('** fieldObj = ' + JSON.stringify(fieldObj));

    var fieldData = {};

    if (fieldObj['@class'] === 'ELEMENT') {
      if (log) console.log('ELEMENT found');
      fieldObj = fieldObj.value;
      if (log) console.log('fieldObj = ' + JSON.stringify(fieldObj, null, 2));
    }

    if (typeof fieldObj === 'string') fieldData.value = fieldObj;

    if (fieldObj.value) fieldData.value = fieldObj.value;
    //if (fieldObj.value && fieldObj.value.value) fieldData.value = fieldObj.value.value;

    if (fieldInfo.type === 'DV_CODED_TEXT' || fieldInfo.type === 'DV_TEXT') {
      if (fieldObj.value && fieldObj.value.value) fieldData.value = fieldObj.value.value;
      if (fieldObj.defining_code) {
        if (fieldObj.defining_code.code_string) fieldData.code = fieldObj.defining_code.code_string;
        if (fieldObj.defining_code.codeString) fieldData.code = fieldObj.defining_code.codeString;
        if (fieldObj.defining_code.terminology_id && fieldObj.defining_code.terminology_id.value) {    
          fieldData.terminology = fieldObj.defining_code.terminology_id.value;
        }
      }
    }

    if (fieldInfo.type === 'CODE_PHRASE') {
      if (fieldObj.code_string) fieldData.value = fieldObj.code_string;
    }

    if (fieldInfo.type === 'PARTY_PROXY') {
      if (fieldObj.name) fieldData.value = fieldObj.name;
    }

    if (fieldInfo.type === 'DV_COUNT') {
      if (fieldObj.magnitude) fieldData.value = fieldObj.magnitude;
    }

    if (fieldInfo.type === 'DV_PARSABLE') {
      if (fieldObj.value && fieldObj.value.value) fieldData.value = fieldObj.value.value;
    }

    if (fieldInfo.type === 'DV_DATE_TIME') {
      if (fieldObj.value && fieldObj.value.value) fieldData.value = fieldObj.value.value;
    }

    if (fieldInfo.type === 'ISM_TRANSITION') {
      if (fieldObj.current_state) {
        if (fieldObj.current_state.value) fieldData.value = fieldObj.current_state.value;
        if (fieldObj.current_state.defining_code) {
          if (fieldObj.current_state.defining_code.code_string) fieldData.code = fieldObj.current_state.defining_code.code_string;
          if (fieldObj.current_state.defining_code.codeString) fieldData.code = fieldObj.current_state.defining_code.codeString;
          if (fieldObj.current_state.defining_code.terminology_id && fieldObj.current_state.defining_code.terminology_id.value) {    
            fieldData.terminology = fieldObj.current_state.defining_code.terminology_id.value;
          }
        }
      }
    }

    if (isEmpty(fieldData)) return;

    var path;
    for (var i = 0; i < fieldInfo.path.length; i++) {
      path = fieldInfo.path[i];
      if (log) console.log('path = ' + path);
      if (!parsedData[path]) parsedData[path] = {};
      if (log) console.log('i = ' + i + '; max: ' + fieldInfo.path.length);
      if (i === (fieldInfo.path.length - 1)) {
        parsedData[path] = fieldData;
      }
      parsedData = parsedData[path];
    }
  });
  //if (log) console.log('** output = ' + JSON.stringify(output, null, 2));
  console.log('** output = ' + JSON.stringify(output, null, 2));
  results.push(output);
});

//if (log) console.log('** results = ' + JSON.stringify(results, null, 2));






