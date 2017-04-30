var socket;
var universe;
//var commandQueue = [];
//var reporterQueue = [];

jQuery(document).ready(function() {
  var userId;
  var userType;
  var turtleDict = {};
  socket = io();

  // show first screen, ask user to enter room
  //Interface.showLogin();

  // save student settings
  socket.on("save settings", function(data) {
    userId = data.userId; 
    userType = data.userType; 
  });
  
  // display teacher or student interface
  socket.on("display interface", function(data) {
    switch (data.userType) {
      case "teacher":
        Interface.showTeacher();
        break;
      case "student":
        Interface.showStudent();
        break;
      case "login":
        Interface.showLogin(data.rooms);
        break;
      case "disconnected":
        Interface.showDisconnected();
        break;
    }
  });
  
  // display admin interface
  socket.on("display admin", function(data) {
    Interface.showAdmin(data.roomData);
  });

  // student repaints most recent changes to world
  socket.on("send update", function(data) {
    //console.log("get update ", data.turtles);
    universe.applyUpdate({turtles: data.turtles});
    universe.repaint();
  });  
  
  socket.on("display admin", function(data) {
    $("#adminData").html(data.roomData);
  });
  
  // students display reporters
  socket.on("display reporter", function(data) {
    //console.log("display reporter", data);
    switch (data.hubnetMessageTag) {
      case "You are a:":
        $("#netlogo-monitor-27 output").html(data.hubnetMessage);
        break;
      case "Located at:":
        $("#netlogo-monitor-28 output").html(data.hubnetMessage);
        break;
      case "Sick?":
        $("#netlogo-monitor-29 output").html(data.hubnetMessage);
        break;
    }
  });
  
  socket.on("execute command", function(data) {
    var messagePackage = [data.hubnetMessageSource, data.hubnetMessageTag, data.hubnetMessage];
    world.hubnetManager.addToHubnetMessageList(messagePackage);
  });
  
  // student leaves activity and sees login page
  socket.on("teacher disconnect", function(data) {
    Interface.showDisconnected();
  });
  
});
