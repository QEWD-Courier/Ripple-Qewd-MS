var options = {
  hashTracking: false
};
var inst = $('[data-remodal-id=modal]').remodal(options);

// Login Click
$('.login').click(function(e){
  e.preventDefault();

  if( Cookies.get('acceptTerms') != 'true' ){
    inst.open();
  } else {
    $(this).closest('form').submit();
  }
});

// Login enter
$(window).keydown(function(e){
  if(e.keyCode == 13) {
    e.preventDefault();
    inst.open();
  }
});

// Agree to terms
$('.agree').click(function(e){
  e.preventDefault();

  // Set Cookie
  Cookies.set('acceptTerms', 'true', { expires: 30 });

  $( $(this).attr('data-target') ).submit();

});

// Decline terms
$('.decline').click(function(e){
  e.preventDefault();
  inst.close();
});
