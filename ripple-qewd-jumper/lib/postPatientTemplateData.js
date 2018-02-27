var openEHR = require('qewd-ripple/lib/openEHR/openEHR');
var loadPatients = require('qewd-ripple/data/loadPatients');
var mapRawJSON = require('./mapRawJSON');
var transform = require('qewd-transform-json').transform;
var Validator = require('jsonschema').Validator;
var v = new Validator();

var headings;

try {
  headings = require('qewd-ripple/lib/jumper/headings.json');
}
catch(err) {
  console.log('** jumper headings have not yet been configured');
}

function isEmpty(obj) {
  for (var name in obj) {
    return false;
  }
  return true;
}

module.exports = function(args, finished) {

  var host = 'marand';
  var self = this;

  if (!args.templateName || args.templateName === '') {
    finished({error: 'Template Name not defined or empty'});
  }

  if (!args.req.body || isEmpty(args.req.body)) {
    finished({error: 'Body payload not defined or empty'});
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

  var inputFormat = 'ripple';
  if (args.req.query && args.req.query.format) {
    inputFormat = args.req.query.format.toLowerCase();
  }

  var openEHRInput = args.req.body;
  var heading = require('qewd-ripple/lib/jumper/' + headings[args.templateName]);

  if (inputFormat === 'ripple') {
    // apply template to convert Ripple Format to OpenEHR format

    openEHRInput = transform(heading.transform.ripple.to.openEHR, openEHRInput, heading.helpers);
  }

  if (inputFormat === 'fhir') {
    // apply template to convert FHIR Format to OpenEHR format

    openEHRInput = transform(heading.transform.fhir.to.openEHR, openEHRInput, heading.helpers);
  }

  // apply the JSON Schema to ensure input data is correct

  var results = v.validate(openEHRInput, heading.schema);

  // if any errors, finish

  console.log('validation results: ' + JSON.stringify(results));

  if (results.errors && results.errors.length > 0) {
    var errors = '';
    var semicolon = '';
    results.errors.forEach(function(error) {
      errors = errors + semicolon + error.property + ': ' + error.message;
      semicolon = ';'; 
    });
    return finished({error: errors});
  }

  // convert to Flat JSON format using template

  var flatJSON = transform(heading.transform.openEHR.to.flatJSON, openEHRInput, heading.helpers);

  // finally, post flat JSON

  openEHR.startSession(host, qewdSession, function (openEHRSession) {
    openEHR.mapNHSNoByHost(args.patientId, host, qewdSession.id, function(ehrId) {
      var aql = {
        aql: "select a as data from EHR e[ehr_id/value='" + ehrId + "'] contains COMPOSITION a[" + aqlFields.composition + "] where a/name/value='" + aqlFields.name + "'"
      };

      var params = {
        host: host,
        url: '/rest/v1/composition',
        queryString: {
          templateId: args.templateName,
          ehrId: ehrId,
          format: 'FLAT'
        },
        method: 'POST',
        session: openEHRSession.id,
        options: {
          body: flatJSON
        }
      };

      params.processBody = function(body, session) {
        openEHR.stopSession(host, openEHRSession, qewdSession);

        if (body.status === 404) {
          return finished({
            error: body.developerMessage,
            input: openEHRInput
          });
        }

        finished({ok: true, response: body});
      };
      //openEHR.request(params);
      finished({ok: 'Not yet implemented', params: params, input: openEHRInput});
    });
  });

};
