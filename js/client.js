var socket;
var oliver;

jQuery(document).ready(function() {
  var userId;
  var userType;
  var turtleDict = {};
  socket = io();

  // show first screen, ask user to enter room
  Interface.showLogin();

  socket.on("display admin", function(data) {
    $("#adminData").html(data.roomData);
  });

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
        Interface.showLogin();
        break;
      case "disconnected":
        Interface.showDisconnected();
        break;
    }
  });
  
  // student repaints most recent changes to world
  socket.on("send update", function(data) {
    oliver.applyUpdate({turtles: data.turtles});
    oliver.repaint();
  });  

  // teacher updates turtle variables
  socket.on("send update turtles", function(data) {
    for (var key in data.turtles) {
      updateTurtle(data.turtles[key]);
    }
  });
  
  // update each variable, for one turtle
  function updateTurtle(oneTurtle) {
    var turtleId = oneTurtle.who;
    if (turtleId != undefined) {
      for (var key in oneTurtle) {
        if (key != "who") {
          world.turtleManager.getTurtle(turtleId).setVariable(key, oneTurtle[key]);
        }
      }
    }
  }
  
  //var colorNames = world.observer.getGlobal("color-names");
  //var usedShapeColors = [];
  var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
	var colors = [9.9, 35, 55, 45, 116, 96];
    
  // student updates reporters
  socket.on("send update reporters", function(data) {
    var turtle = data.turtle;
    if (turtle.infected != undefined) { $("#infected").html("" + turtle.infected); }
    if (turtle.xcor) { $("#xcor").html(turtle.xcor); }
    if (turtle.ycor) { $("#ycor").html(turtle.ycor); }
    if (turtle.color) {
      var colorIndex = colors.indexOf(turtle.color);
      $("#color").html(colorNames[colorIndex]); 
    }
    if (turtle.shape) { $("#shape").html(turtle.shape); }
  });

  // teacher runs create-new-student
  socket.on("setup student", function(data) {
    var userId = data.userId;
    var patchSize = world.patchSize;
    var xcor = Math.floor(Math.random() * patchSize) - 10;
    var ycor = Math.floor(Math.random() * patchSize) - 10;
    var turtleId = world.turtleManager.createTurtles(1, "students", xcor, ycor).toArray()[0].id;
    socket.emit("create student", {turtleId: turtleId, userId: userId});
  });
  
  socket.on("remove student", function(data) {
    var turtleId = data.turtleId;
    world.turtleManager.getTurtle(turtleId).die();
  });
  
  // student leaves activity and sees login page
  socket.on("teacher disconnect", function(data) {
    Interface.showLogin();
  });
  
});
