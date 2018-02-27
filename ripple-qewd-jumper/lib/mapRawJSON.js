var traverse = require('traverse');

module.exports = function(rawjson, templateId, documentName) {

  documentName = documentName || 'RippleQEWDJumper';

  var templateDoc = this.db.use(documentName, 'templateMap', templateId);
  var templateIndex = templateDoc.$('index');
  var templateFields = templateDoc.$('field');

  var results = [];

  rawjson.resultSet.forEach(function(record) {

    var result = {
      uid: record.data.uid.value,
      composer: {
        value: record.data.composer.name
      },
      start_time: record.data.context.start_time.value
    };

    traverse(record.data.content[0]).map(function(node) {
      if (node['@class']) {
        if (node['@class'] === 'ELEMENT') {

          var parent = this.parent;
          var path = '';
          do {
            if (Number.isInteger(parseInt(parent.key))) {
              piece = parent.node.archetype_node_id;
              path = '[' + piece + ']/' + path;
            }
            else {
              piece = parent.key;
              if (typeof piece === 'undefined') piece = '/content';
              if (parent.node.archetype_node_id) piece = piece + '[' + parent.node.archetype_node_id + ']';
              if (path !== '' && path[0] !== '[') path = '/' + path;
              path = piece + path;
            }
            parent = parent.parent;
          }
          while (parent);
          if (node.archetype_node_id) {
            piece = node.archetype_node_id;
            path = path + '[' + piece + ']';
          }
          var aqlArr = path.split('/');
          aqlArr.shift();

          aqlArr.push(node.name.value);
          var index = templateIndex.$(aqlArr);

          if (index.exists) {
            var fieldId = index.value;
            var fieldDoc = templateFields.$(fieldId);
            var fieldArr = fieldDoc.$('path').getDocument(true);
            var obj = result;
            var max = fieldArr.length - 1;
            fieldArr.forEach(function(name, index) {
              if (typeof obj[name] === 'undefined') obj[name] = {};
              if (index === max) {
                obj[name] = {
                  value: node.value.value
                };
                if (node.value.defining_code) {
                  obj[name].code = node.value.defining_code.code_string;
                  if (node.value.defining_code.terminology_id) obj[name].terminology = node.value.defining_code.terminology_id.value;
                }
              }
              obj = obj[name];
            });
          
          }       
        }
      }
    });
   results.push(result);
  })
  return results;
};

