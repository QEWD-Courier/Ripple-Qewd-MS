module.exports = function(args, finished) {
  var nhsNumber = args.session.nhsNumber;

  var patient = this.db.use('RipplePHRPatients', 'byId', nhsNumber);
  var demographics = patient.getDocument();

  finished({
    demographics: demographics
  });
};