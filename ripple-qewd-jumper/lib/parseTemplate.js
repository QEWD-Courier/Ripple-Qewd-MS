

function parseTemplate(templateObj) {
  var path = [];
  var info = [];
  parse(templateObj.webTemplate.tree.children, path, info);
  return info;
}

function parse(obj, path, info) {
  obj.forEach(function(node) {
    var currentPath = path.slice(0);
    currentPath.push(node.id);

    if (node.children) {
      parse(node.children, currentPath, info);
    }
    else {
      var pieces = node.aqlPath.split('/');
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
      newPath.splice(-1, 1); // remove last item

      var required = false;
      if (node.min > 0) required = true;

      info.push({
        id: node.id,
        name: node.name,
        path: currentPath,
        type: node.rmType,
        aqlPath: node.aqlPath,
        pathArr: newPath,
        required: required,
        max: node.max
      });
    }
  });
};

module.exports = parseTemplate;
