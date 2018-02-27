var openEHR = require('qewd-ripple/lib/openEHR/openEHR');
var loadPatients = require('qewd-ripple/data/loadPatients');
var mapRawJSON = require('./mapRawJSON');
var transform = require('qewd-transform-json').transform;

var headings;

try {
  headings = require('qewd-ripple/lib/jumper/headings.json');
}
catch(err) {
  console.log('** jumper headings have not yet been configured');
}

module.exports = function(args, finished) {

  var host = 'marand';
  var self = this;

  if (!args.templateName || args.templateName === '') {
    finished({error: 'Template Name not defined or empty'});
  }

  var templateId;
  var documentName = 'RippleQEWDJumper';
  var templateReg = this.db.use(documentName, 'templates');
  var templateByName = templateReg.$(['byName', args.templateName]);
  if (templateByName.exists) {
    templateId = templateByName.value;
  }
  else {
    return {error: 'Template Name was not recognised'};
  }
  var aqlFields = this.db.use(documentName, 'templateMap', templateId, 'aql').getDocument();

  if (!args.patientId || args.patientId === '' || args.patientId === 'null' || args.patientId === 'undefined') {
    finished({error: 'Patient Id not defined or empty'});
  }

  var patients = this.db.use('RipplePatients');
  if (!patients.exists) loadPatients.call(this);
  var patients = this.db.use('RipplePatients', 'byId');

  var practitioners = this.db.use('RipplePractitioners');

  var qewdSession = args.session;

  openEHR.startSession(host, qewdSession, function (openEHRSession) {
    openEHR.mapNHSNoByHost(args.patientId, host, qewdSession.id, function(ehrId) {
      var aql = {
        aql: "select a as data from EHR e[ehr_id/value='" + ehrId + "'] contains COMPOSITION a[" + aqlFields.composition + "] where a/name/value='" + aqlFields.name + "'"
      };

      var params = {
        host: host,
        url: '/rest/v1/query',
        method: 'POST',
        options: {
          body: aql
        },
        session: openEHRSession.id
      };

      params.processBody = function(body, session) {
        openEHR.stopSession(host, openEHRSession, qewdSession);

        if (body.status === 404) {
          return finished({
            error: body.developerMessage
          });
        }

        var results = mapRawJSON.call(self, body, templateId, documentName);
        results.forEach(function(result) {
          result.host = host;
          result.patientId = args.patientId;
          result.patientName = patients.$([args.patientId, 'name']).value;
          var composer = result.composer.value;
          var practitionerRecord = practitioners.$(['byName', composer]);
          if (practitionerRecord.exists) {
            result.composer.code = practitionerRecord.$('code').value;
          }
          else {
            var pcode = practitioners.$('no').increment();
            practitioners.$(['byName', composer, 'code']).value = pcode;
            practitioners.$(['byId', pcode]).value = composer;
            result.composer.code = pcode;
          }
        });

        if (args.req.query && args.req.query.format) {
          var format = args.req.query.format.toLowerCase();
          if (headings && headings[args.templateName] && (format === 'rippleui' || format === 'fhir')) {
            var heading = require('qewd-ripple/lib/jumper/' + headings[args.templateName]);
            var arr = results;
            results = [];
            var result;
            var count = 0;
            arr.forEach(function(record) {
              if (format === 'rippleui') {          
                result = transform(heading.transform.openEHR.to.ripple, record, heading.helpers);
              }
              else if (format === 'fhir') {
                count++;
                result = transform(heading.transform.openEHR.to.fhir, record, heading.helpers);
              }
              results.push(result);
            });
            if (format === 'fhir') {
              results = {
                resourceType: 'Bundle',
                total: count,
                entry: results
              };
            }
          }
        }

        finished(results);
      };
      openEHR.request(params);
    });
  });

};
