/*

 ----------------------------------------------------------------------------
 | ripple-phr-primary: Ripple MicroServices for Primary Server              |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  11 January 2018

*/

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
  var heading = $('<h4>' + capitalise(id) + '</h4>');
  container.append(heading);

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
    console.log('detail for ' + sourceId + ': ' + JSON.stringify(data));
    //$('#detail').show();
    //$('#detail').text(JSON.stringify(data.results, null, 2));
    jqAlert(JSON.stringify(data.results, null, 2), sourceId);
  });
}

function getAllergies() {
  $.ajax({
    url: '/api/my/heading/allergies',
    headers: standardHeaders() 
  })
  .success(function(data) {
    console.log('getAllergies: ' + JSON.stringify(data));
    createTable(data.results, 'allergies');

  });
}

function getHeadingSummary() {
  $.ajax({
    url: '/api/my/summary',
    headers: standardHeaders() 
  })
  .success(function(data) {
    console.log('headinmg summary: ' + JSON.stringify(data));
    var fields = ['sourceId', 'text', 'source'];
    createTable(data, 'allergies', fields, 'sourceId');
    createTable(data, 'contacts', fields, 'sourceId');
  });
}

$(document).ready(function() {

  // invoke callback to Authentication server to get id_token JWT

  $('#detail').hide();

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
