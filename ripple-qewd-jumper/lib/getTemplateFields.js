
module.exports = function(templateName) {

  if (!templateName || templateName === '') {
    return {error: 'Template Name missing or empty'};
  }

  var templateId;
  var documentName = 'RippleQEWDJumper';
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', templateName]);
  if (templateByName.exists) {
    templateId = templateByName.value;
  }
  else {
    return {error: 'Template Name was not recognised'};
  }

  var templateFields = this.db.use(documentName, 'templateMap', templateId, 'field');

  var fieldObj = {
    uid: '{{uid}}',
    composer: {
      value: '{{composer}}'
    },
    host: '{{host}}',
    patientId: '{{patientId}}'
  };

  templateFields.forEachChild(function(fieldNo, node) {
    var pathArr = node.$('path').getDocument(true);
    var id = node.$('id').value;
    var type = node.$('type').value;
    var obj = fieldObj;
    var max = pathArr.length - 1;
    pathArr.forEach(function(name, index) {
      if (typeof obj[name] === 'undefined') obj[name] = {};
      if (index === max) {
        obj[name] = {
          value: '{{' + id + '}}'
        };
        if (type === 'DV_TEXT' || type === 'DV_CODED_TEXT') {
          obj[name].code = '{{' + id + '_codeString}}';
          obj[name].terminology = '{{' + id + '_terminology}}';
        }
      }
      obj = obj[name];
    });
  });

  return fieldObj;

};