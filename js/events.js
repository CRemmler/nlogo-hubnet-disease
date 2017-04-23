jQuery(document).ready(function() {

  // when student submits room name
  $("#submitRoomString").click(function() {
    var myRoom = $("#roomString").val();
    socket.emit("enter room", {room: myRoom});
  });
  
  // when student clicks stepsize slider
  $("#netlogo-slider-26").click(function() {
    stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
    socket.emit("send command", {hubnetMessageTag: "step-size", hubnetMessage: stepsize});
  });
  
  // when student pushes down button
  $("#netlogo-button-21").click(function() {
    socket.emit("send command", {hubnetMessageTag: "Down", hubnetMessage: ""});
  });
  
  // when student pushes up button
  $("#netlogo-button-22").click(function() {
    socket.emit("send command", {hubnetMessageTag: "Up", hubnetMessage: ""});
  });
  
  // when student pushes right button
  $("#netlogo-button-23").click(function() {
    socket.emit("send command", {hubnetMessageTag: "Right", hubnetMessage: ""});
  });
  
  // when student pushes left button
  $("#netlogo-button-24").click(function() {
    socket.emit("send command", {hubnetMessageTag: "Left", hubnetMessage: ""});
  });
  
  // when student pushes change appearance button
  $("#netlogo-button-25").click(function() {
    socket.emit("send command", {hubnetMessageTag: "Change Appearance", hubnetMessage: ""});
  });
  
});