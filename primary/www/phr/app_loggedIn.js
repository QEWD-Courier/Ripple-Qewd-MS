var jwt;
var stardardHeaders;

function jqAlert(outputMsg, titleMsg, onCloseCallback) {
  if (!titleMsg) titleMsg = 'Alert';
  if (!outputMsg) outputMsg = 'No Message to Display.';

  $("<div></div>").dialog( {
    buttons: { "Ok": function () { $(this).dialog("close"); } },
    close: function (event, ui) { $(this).remove(); },
    resizable: false,
    title: titleMsg,
    modal: true
  }).text(outputMsg);
}

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
    url: '/api/my/demographics',
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

function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createTable(results, id, fieldArray, indexField) {
  var data = results[id];
  var container = $('#' + id);
  var heading = $('<h4>' + capitalise(id) + '&nbsp;<button id="add' + id + 'Btn">Add</button></h4>');
  container.html(heading);

  var table = $('<table id="' + id + '">');
  var tr;
  data.forEach(function(record) {
    if (indexField) {
      tr = $('<tr id="' + record[indexField] + '">');
    }
    else {
      tr = $('<tr>');
    }
    //['cause', 'reaction', 'source', 'sourceId'].forEach(function(attr) {
    fieldArray.forEach(function(attr) {
      if (attr !== indexField) {
        tr.append('<td>' + record[attr] + '</td>');
      }
    });
    table.append(tr);
  });

  container.append(table);
  $('#' + id + ' tr').click(function() {
    console.log('clicked ' + this.id + ': ' + id);
    getHeadingDetail(id, this.id);
  });
}

function getHeadingDetail(heading, sourceId) {
  $.ajax({
    url: '/api/my/heading/' + heading + '/' + sourceId,
    headers: standardHeaders() 
  })
  .success(function(data) {
    jwt = data.token; // update JWT to latest
    console.log('detail for ' + sourceId + ': ' + JSON.stringify(data));
    //$('#detail').show();
    //$('#detail').text(JSON.stringify(data.results, null, 2));
    jqAlert(JSON.stringify(data.results, null, 2), sourceId);
  });
}

function getHeading(heading) {
  $.ajax({
    url: '/api/my/heading/' + heading,
    headers: standardHeaders() 
  })
  .success(function(data) {
    jwt = data.token; // update JWT to latest

    //console.log('getheading: ' + JSON.stringify(data));
    if (data.results && data.results.length > 0) {
      var fields = [];
      for (var fieldName in data.results[0]) {
        fields.push(fieldName);
      }
      var headingData = {};
      headingData[heading] = data.results;
      createTable(headingData, heading, fields, 'sourceId');
    }
  });
}

function postHeading(heading) {

  console.log('** posting ' + heading);

  var $inputs = $('#' + heading + 'Form :input');
  var data = {};
  var name;
  $inputs.each(function() {
    if (this.id !== 'submit' + heading + 'Btn') {
      name = this.id.split(heading + '-')[1]
      data[name] = $(this).val();
    }
  });

  console.log('data = ' + JSON.stringify(data));

  $.ajax({
    url: '/api/my/heading/' + heading,
    headers: standardHeaders(),
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(data),
    success: function(data) {
      console.log('postheading response: ' + JSON.stringify(data));
      jwt = data.token; // update JWT to latest
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('Error: ' + jqXHR.responseJSON.error);
    }
  });

}

function getHeadingSummary() {
  $.ajax({
    url: '/api/my/headings/synopsis',
    headers: standardHeaders() 
  })
  .success(function(data) {
    jwt = data.token; // update JWT to latest
    console.log('headinmg summary: ' + JSON.stringify(data));
    var fields = ['sourceId', 'text', 'source'];
    createTable(data, 'allergies', fields, 'sourceId');
    createTable(data, 'contacts', fields, 'sourceId');
    createTable(data, 'medications', fields, 'sourceId');
    createTable(data, 'problems', fields, 'sourceId');


    $('#addallergiesBtn').on('click', function() {
      $("#allergiesForm").dialog("open");
      console.log('should open popup form');
    });

  });

  $('#allergiesBtn').on('click', function() {
    getHeading('allergies');
  });

  $('#medicationsBtn').on('click', function() {
    getHeading('medications');
  });

  $('#problemsBtn').on('click', function() {
    getHeading('problems');
  });

  $('#contactsBtn').on('click', function() {
    getHeading('contacts');
  });

}

$(document).ready(function() {

  // invoke callback to Authentication server to get id_token JWT

  $('#detail').hide();

  $("#allergiesForm").dialog({
    autoOpen: false
  });

  $('#submitallergiesBtn').on('click', function() {
    postHeading('allergies');
  });

  var code = getQueryString('code');
  if (!code || code === '') {
    alert('No callback code');
    return;
  }

  $.ajax({
    url: '/api/oauth/callback?code=' + getQueryString('code')
  })
  .success(function(data) {
    console.log('**** got ' + JSON.stringify(data));
    jwt = data.token;

    // now that we have the JWT, we can ask for the user's demographics from the hospital server

    getDemographics();

    // and the patient's summary headings

    //getAllergies();
    getHeadingSummary();

  })
  .error(function(err) {
    console.log('Error: ' + JSON.stringify(err));
    alert('Invalid login');
  });

});
