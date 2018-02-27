var openEHR = require('qewd-ripple/lib/openEHR/openEHR');
var parseTemplate = require('./parseTemplate');
var getTemplateFields = require('./getTemplateFields');
var createFlatJSON = require('./createFlatJSON');
var createJSONSchema = require('./createJSONSchema');
var path = require('path');
var fs = require('fs-extra');

var jumper;

try {
  jumper = require('qewd-ripple/lib/jumper');
}
catch(err) {
  console.log('*** qewd-ripple/lib/jumper has not yet been configured');
}

module.exports = function(args, finished) {

  var host = 'marand';
  var self = this;

  if (!args.templateName || args.templateName === '') {
    finished({error: 'Template Name not defined or empty'});
  }

  openEHR.startSession(host, args.session, function (openEHRSession) {

    var params = {
      host: host,
      url: '/rest/v1/template/' + args.templateName,
      method: 'GET',
      session: openEHRSession.id
    };

    params.processBody = function(body, session) {
      openEHR.stopSession(host, openEHRSession, args.session);

      if (body.status === 404) {
        return finished({
          error: body.developerMessage
        });
      }

      var results = parseTemplate(body);
      var templateName = args.templateName;
      var templateId;
      var documentName = 'RippleQEWDJumper';
      var templateReg = self.db.use(documentName, 'templates');
      var templateByName = templateReg.$(['byName', templateName]);
      if (templateByName.exists) {
        templateId = templateByName.value;
      }
      else {
        templateId = templateReg.increment();
        templateByName.value = templateId;
        templateReg.$(['byId', templateId]).value = templateName;
      }

      var templateDoc = self.db.use(documentName, 'templateMap', templateId);
      templateDoc.delete();

      templateDoc.$('aql').setDocument({
        composition: body.webTemplate.tree.nodeId,
        name: body.webTemplate.tree.name
      });

      templateIndex = templateDoc.$('index');
      templateFields = templateDoc.$('field');
      var fieldId = 0;

      //console.log('&&&& results: ' + JSON.stringify(results));

      results.forEach(function(result) {
        fieldId++;
        var arr = result.pathArr;
        var name = result.name || result.id;
        arr.push(name);
        templateIndex.$(arr).value = fieldId;

        templateFields.$(fieldId).setDocument({
          id: result.id,
          type: result.type,
          path: result.path
        });
      });

      var fieldObj = getTemplateFields.call(self, templateName);

      var flatJSON = createFlatJSON(body);
      templateDoc.$('flatJSON').setDocument(flatJSON);

      if (jumper && jumper.map && jumper.map[templateName]) {
        var headingFolder = jumper.map[templateName];
        var pieces = jumper.path.split(path.sep);
        pieces.splice(-1, 1); // remove filename from path
        pieces.push(headingFolder);
        pieces.push('flatJSON_template.json');
        var filePath = pieces.join(path.sep);
        fs.writeJsonSync(filePath, flatJSON, {spaces: 2});

        pieces.splice(-1, 1); // remove filename from path again
        pieces.push('OpenEHR_get_template.json');
        var filePath = pieces.join(path.sep);
        fs.writeJsonSync(filePath, fieldObj, {spaces: 2});

        // Create JSON Schema for data entry validation, using parse results

        pieces.splice(-1, 1); // remove filename from path again
        filePath = pieces.join(path.sep);
        console.log('Creating JSON Schema for ' + templateName + '; ' + filePath);
        createJSONSchema(templateName, results, filePath);

      }

      finished({
        ok: true,
        template: args.templateName,
        fields: fieldObj,
        flatJSON: flatJSON,
        results: results
      });
    };

    openEHR.request(params);

  });

};