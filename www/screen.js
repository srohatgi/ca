function onScreenLoad() {
  //alert('inside onScreenLoad()');
  if ( PUSH_SERVER_IP ) {
    $('#push-ip').val(PUSH_SERVER_IP);
  }
  $('#push-ip-submit').click(function () {
    setupPushIP($("#push-ip").val());
    return true;
  }); 
}