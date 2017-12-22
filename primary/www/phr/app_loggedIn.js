var jwt;
var stardardHeaders;

function getQueryString(field) {
  var href = window.location.href;
  var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
  var string = reg.exec(href);
  return string ? string[1] : null;
}

function standardHeaders() {
  return {Authorization: 'Bearer ' + jwt};
}

function getDemographics() {
  $.ajax({
    url: '/phr/my/demographics',
    headers: standardHeaders() 
  })
  .success(function(data) {
    console.log('getDemographics: ' + JSON.stringify(data.demographics));

    $('#title').text('You are Logged  into the Leeds PHR');
    $('#user_name').text(data.demographics.name);
    $('#user_nhsNumber').text(data.demographics.nhsNumber);
    $('#user_address').text(data.demographics.address);
    $('#user_dob').text(new Date(data.demographics.dateOfBirth).toDateString());
    $('#user_sex').text(data.demographics.gender);

    jwt = data.token; // update JWT to latest

  });
}

function createTable(data, id) {
  var container = $('#' + id)
  var table = $('<table>');

  data.forEach(function(record) {
    var tr = $('<tr>');
    ['cause', 'reaction', 'source', 'sourceId'].forEach(function(attr) {
      tr.append('<td>' + record[attr] + '</td>');
    });
    table.append(tr);
  });

  container.append(table);
}

function getAllergies() {
  $.ajax({
    url: '/phr/my/heading/allergies',
    headers: standardHeaders() 
  })
  .success(function(data) {
    console.log('getAllergies: ' + JSON.stringify(data));
    createTable(data.response, 'allergies');

  });
}

$(document).ready(function() {

  // invoke callback to Authentication server to get id_token JWT

  var code = getQueryString('code');
  if (!code || code === '') {
    alert('No callback code');
    return;
  }

  $.ajax({
    url: '/phr/oauth/callback?code=' + getQueryString('code')
  })
  .success(function(data) {
    console.log('**** got ' + JSON.stringify(data));
    jwt = data.token;

    // now that we have the JWT, we can ask for the user's demographics from the hospital server

    getDemographics();

    // and the patient's headings

    getAllergies();

  })
  .error(function(err) {
    console.log('Error: ' + JSON.stringify(err));
    alert('Invalid login');
  });

});
