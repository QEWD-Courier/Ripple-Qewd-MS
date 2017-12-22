var patientHeadingTable = require('./patientHeadingTable');

module.exports = function(args, finished) {
  var nhsNumber = args.session.nhsNumber;

  //console.log('Verify JWT = ' + JSON.stringify(args.session.verify_jwt));

  var params = {
    patientId: nhsNumber,
    heading: args.heading,
    session: args.req.qewdSession
  };

  patientHeadingTable.call(this, params, function(response) {
    finished({
      responseFrom: 'phr_service',
      response: response
    });
  });
};