$(document).ready(function() {

  $('#testBtn').on('click', function(e) {
    var message = {type: 'testButton'};
    $.ajax({
      url: '/phr/oauth/login'
    })
    .done(function(data) {
      console.log('**** got ' + JSON.stringify(data));
      sessionStorage.jwt = data.token;
      window.location = data.redirectURL;
    });
  });

});
