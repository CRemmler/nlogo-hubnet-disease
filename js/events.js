jQuery(document).ready(function() {
    
  //////////////////////////////////////////
  // DISEASE - Client Buttons and Sliders //
  //////////////////////////////////////////
  var stepsize;
  
  // when student clicks stepsize slider
  $("#netlogo-slider-26").click(function() {
    stepsize = +$("#netlogo-slider-26 .netlogo-slider-value input").val();
    socket.emit("send command", {hubnetMessageTag: "step-size", hubnetMessage: stepsize});
  });
  
  // when student clicks on button on Student Interface
  $(".netlogo-widget-container").on("click", ".student-button", function() {
    console.log("click on student button ");
    console.log($(this).text().trim());
    socket.emit("send command", {hubnetMessageTag: $(this).text().trim(), hubnetMessage:""});
  });
  /////////
  // END //
  /////////
  
  // when user clicks on Create Room Button on Login Interface
  $(".netlogo-widget-container").on("click", ".create-room-button", function() {
    var myRoom = $(".create-room-input").val();
    socket.emit("enter room", {room: myRoom});
  });
  
  // when user clicks on Room Button on Login Interface
  $(".netlogo-widget-container").on("click", ".join-room-button", function() {
    var myRoom = $("#"+$(this).attr("id")+" span").html();
    socket.emit("enter room", {room: myRoom});
  });
});