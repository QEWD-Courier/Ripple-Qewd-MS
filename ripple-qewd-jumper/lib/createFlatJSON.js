function getSource(id, extra) {
  var pieces = id.split('/');
  pieces.shift(); // remove first element
  pieces.forEach(function(piece, index) {
    if (piece.indexOf(':0') !== -1) {
      pieces[index] = piece.split(':0')[0];
    }
  });
  if (extra && extra !== '') pieces.push(extra);
  return '=> either(' + pieces.join('.') + ', <!delete>)';
}


function getPaths(obj, path, paths) {
  obj.forEach(function(node) {
    if (node.id === 'context' && node.aqlPath === '/context') return; // ignore these
    if (node.id === 'composer' && node.aqlPath === '/composer') return; // ignore this
    if (node.id === 'language' && node.rmType === 'CODE_PHRASE' && !node.children) return; // ignore this
    if (node.id === 'encoding' && node.rmType === 'CODE_PHRASE' && !node.children) return; // ignore this
    if (node.id === 'subject' && node.rmType === 'PARTY_PROXY' && !node.children) return; // ignore this
    var currentPath = path;
    if (currentPath !== '') currentPath = currentPath + '/';
    currentPath = currentPath + node.id;

    if (node.children) {
      if (node.max === -1) currentPath = currentPath + ':0';
      getPaths(node.children, currentPath, paths);
    }
    else {
      //if (!node.inContext) {
        if (node.rmType === 'DV_TEXT' || node.rmType === 'DV_CODED_TEXT') {
          if (node.max === -1) currentPath = currentPath + ':0';
          paths.push({
            id: getSource(currentPath, 'value'),
            path: currentPath + '|value'
          });
          paths.push({
            id: getSource(currentPath, 'code'),
            path: currentPath + '|code'
          });
          paths.push({
            id: getSource(currentPath, 'terminology'),
            path: currentPath + '|terminology'
          });
        }
        /*
        else if (node.rmType === 'DV_CODED_TEXT') {
          if (node.max === -1) currentPath = currentPath + ':0';
          node.inputs.forEach(function(input) {
            var id = node.id;
            if (input.suffix !== 'value') id = id + '_' + input.suffix; 
            paths.push({
              id: getSource(node.id, input.suffix),
              path: currentPath + '|' + input.suffix
            });
          });
        }
        */
        else {
          paths.push({
            id: getSource(currentPath),
            path: currentPath
          });
        }
      //}

    }
  });
}

function createFlatJSONTemplate(webTemplate) {

  var templateTree = webTemplate.webTemplate.tree;
  var path = '';
  var paths = [
    {id: "=> either(composer.value, 'Dr Tony Shannon')", path: 'ctx/composer_name'},
    {id: "=> either(facility_id, '999999-345')", path: 'ctx/healthcare_facility|id'},
    {id: "=> either(facility_name, 'Rippleburgh GP Practice')", path: 'ctx/healthcare_facility|name'},
    {id: '== NHS-UK', path: 'ctx/id_namespace'},
    {id: '== 2.16.840.1.113883.2.1.4.3', path: 'ctx/id_scheme'},
    {id: '== en', path: 'ctx/language'},
    {id: '== GB', path: 'ctx/territory'},
    {id: '=> now()', path: 'ctx/time'}
  ];
  getPaths([templateTree], path, paths);

  var results = {};
  paths.forEach(function(path) {
    var id = path.id;
    if (id.substring(0,2) === '=>') {
      results[path.path] = id;
    }
    else if (id.substring(0,2) === '==') {
      results[path.path] = id.split('== ')[1];
    }
    else {
      results[path.path] = '{{' + id + '}}';
    }
  });

  return results;
}

module.exports = createFlatJSONTemplate;

