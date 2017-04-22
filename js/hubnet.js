Hubnet = (function() {

  var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
	//world.observer.getGlobal("color-names");
	var colors = [9.9, 35, 55, 45, 116, 96];
	//world.observer.getGlobal("colors");
	var shapeNames =["box", "star", "wheel", "target", "cat", "dog", "butterfly", "leaf", "car", "airplane", "monster", "key", "cow skull", "ghost", "cactus", "moon", "heart"]
	//world.observer.getGlobal("shape-names");
	var maxPossibleCodes = colors.length * shapeNames.length;
  
  var roomData = {};
  
  function changeAppearance(roomId, turtle, turtleId) {
    var myBaseShape = turtle.BASESHAPE;
    var myColor = turtle.COLOR;
    var myCode = shapeNames.indexOf(myBaseShape) + shapeNames.length + colors.indexOf(myColor);
    var myShape = turtle.SHAPE;
    var myInfected = turtle.INFECTED;
    var usedShapeColors = roomData[roomId].usedShapeColors;
    roomData[roomId].usedShapeColors = usedShapeColors.splice(usedShapeColors.indexOf(myCode,1));
    myCode = Math.floor(Math.random() * maxPossibleCodes);
    if (usedShapeColors.length < maxPossibleCodes) {
      while (usedShapeColors.indexOf(myCode) != -1) {
        myCode = Math.floor(Math.random() * maxPossibleCodes);
      }
    }
    roomData[roomId].usedShapeColors.push(myCode);
    var key = myCode % shapeNames.length;
    myBaseShape = shapeNames[key];
    myShape = myBaseShape;
    key = myCode / shapeNames.length;
    myColor = colors[Math.floor(key)];
    if (myInfected) {
      if (myShape != (myBaseShape + " sick")) { myShape = myBaseShape + " sick"; }
    }
    var updateTurtles = {};
    var updateTurtle = {};
    updateTurtle.who = turtleId;
    updateTurtle.shape = myShape;
    updateTurtle.color = myColor;
    updateTurtle.baseshape = myBaseShape;
    updateTurtles[turtleId] = updateTurtle;
    return updateTurtles;
  }
  
  function executeMove(turtle, turtleId) {
    var turtle;
    var max = 10;
    var updateTurtles = {};
    var updateTurtle = {};
    updateTurtle.who = turtleId;
    switch (data.heading) {
      case 0:
        if ((Math.abs(turtle.YCOR + data.stepsize)) <= max) {
          updateTurtle.ycor = turtle.YCOR + data.stepsize;
        }
        break;
      case 90:
        if ((Math.abs(turtle.XCOR + data.stepsize)) <= max) {
          updateTurtle.xcor = turtle.XCOR + data.stepsize;
        }
        break;
      case 180:
        if ((Math.abs(turtle.YCOR - data.stepsize)) <= max) {
          updateTurtle.ycor = turtle.YCOR - data.stepsize;
        }
        break;
      case 270:
        if ((Math.abs(turtle.XCOR - data.stepsize)) <= max) {
          updateTurtle.xcor = turtle.XCOR - data.stepsize;
        }
        break;
    }
    updateTurtles[turtleId] = updateTurtle;
    return updateTurtles;
  }
  
  function checkInfect(room, turtleId) {
    var updateTurtles = {};
    var updateTurtle;
    var turtles = room.turtles;
    var myXcor = room.turtles[turtleId].XCOR;
    var myYcor = room.turtles[turtleId].YCOR;
    var infectionChance = room.options.infectionChance;
    var turtlesHere = {};
    var infectionHere = room.turtles[turtleId].INFECTED;
    turtlesHere[turtleId] = room.turtles[turtleId];
    for (var key in turtles) {
      if (turtles[key].XCOR === myXcor) {
        if (turtles[key].YCOR === myYcor) {
          turtlesHere[key] = turtles[key];
          if (turtles[key].INFECTED === true) {
            infectionHere = true;
          }
        }
      }
    }
    // pick which turtles get infected
    if (infectionHere) {
      for (var key in turtlesHere) {
        if (Math.random() * 100 + 1 <= infectionChance) {  
          if (!turtlesHere[key].INFECTED) 
          { 
            if (!updateTurtles[key]) {
              updateTurtle = {};
              updateTurtle.who = turtlesHere[key].WHO;							
            }
            updateTurtle.infected = true;
            updateTurtle.shape = room.turtles[key].BASESHAPE + " sick";
            updateTurtles[turtleId] = updateTurtle;
          }
        } 
      }
      return updateTurtles;
    }	else {
      return null;
    }
  }
  
  function createStudent(roomId, turtleId) {
    if (!roomData[myRoom]) { 
      roomData[myRoom] = {}; 
      roomData[myRoom].usedShapeColors = [];
    }
    myCode = Math.floor(Math.random() * maxPossibleCodes);
    var usedShapeColors = room.options.usedShapeColors;
    if (usedShapeColors.length < maxPossibleCodes) {
      while (usedShapeColors.indexOf(myCode) != -1) {
        myCode = Math.floor(Math.random() * maxPossibleCodes);
      }
    }
    roomData[myRoom].usedShapeColors.push(myCode);
    var updateTurtles = {};
    var updateTurtle = {};
    var key = myCode % shapeNames.length;
    var myBaseShape = shapeNames[key];
    var myShape = myBaseShape;
    key = myCode / shapeNames.length;
    var myColor = colors[Math.floor(key)];
    updateTurtle.who = myTurtleId;
    updateTurtle.shape = myShape;
    updateTurtle.color = myColor;
    updateTurtle.baseshape = myBaseShape;
    updateTurtles[turtleId] = updateTurtle;
    return updateTurtles;
  }

  function removeStudent(turtle) {
    var myBaseShape = turtle.BASESHAPE;
    var myColor = turtle.COLOR;
    var myCode = shapeNames.indexOf(myBaseShape) + shapeNames.length + colors.indexOf(myColor);
    var usedShapeColors = roomData[myRoom].usedShapeColors;
    roomData[myRoom].usedShapeColors = usedShapeColors.splice(usedShapeColors.indexOf(myCode,1));
  }

  return {
    changeAppearance: changeAppearance,
    executeMove: executeMove,
    checkInfect: checkInfect,
    createStudent: createStudent,
    removeStudent: removeStudent
  };

}