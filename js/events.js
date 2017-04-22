jQuery(document).ready(function() {

  //-------------------//
  // Events From login
  //-----------------------//
  
  // when student submits room name
  $("#submitRoomString").click(function() {
    var myRoom = $("#roomString").val();
    socket.emit("enter room", {room: myRoom});
  });
  
  //-----------------------//
  // Events From teacher
  //-----------------------//
  
  //-----------------------//
  // Events From student
  //-----------------------//
  
  var infectionChance = +$("#netlogo-slider-2 .netlogo-slider-value input").val();
  //socket.emit("change infection chance", {infectionChance, infectionChance});  
  
  // when teacher clicks infection-chance slider
  $("#netlogo-slider-2").click(function() {
    infectionChance = +$("#netlogo-slider-2 .netlogo-slider-value input").val();
    socket.emit("change infection chance", {infectionChance, infectionChance});
  });
  
  var stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
  // when student clicks stepsize slider
  $("#netlogo-slider-26").click(function() {
    stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
  });
  
  // when student pushes down button
  $("#netlogo-button-21").click(function() {
    move(180);
  });
  
  // when student pushes up button
  $("#netlogo-button-22").click(function() {
    move(0);
  });
  
  // when student pushes right button
  $("#netlogo-button-23").click(function() {
    move(90);
  });
  
  // when student pushes left button
  $("#netlogo-button-24").click(function() {
    move(270);
  });
  
  $("#netlogo-button-25").click(function() {
    socket.emit("change appearance"); 
  });
  
  function move(degrees) {
    socket.emit("execute move", {heading: degrees, stepsize: stepsize}); 
    socket.emit("check infect"); 
  }
  
});