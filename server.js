var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
const PORT = process.env.PORT || 3000;

var roomData = {};

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket){
	
	// user enters room
	socket.on("enter room", function(data) {
		var myUserType, myUserId, myTurtleId;
		
		if (data.room === "admin") {
			
			socket.emit("display admin", {roomData: getRoomData()});
			
		} else {
	    // declare myRoom
	    socket.myRoom = data.room;
	    var myRoom = socket.myRoom;
			if (!roomData[myRoom]) {
				roomData[myRoom] = {};
				roomData[myRoom].teacherInRoom = false;
	      roomData[myRoom].turtles = {};
				roomData[myRoom].turtleDict = {};
				roomData[myRoom].userIdDict = {};
				roomData[myRoom].options = {};
				roomData[myRoom].options.infectionChance = 100;
				roomData[myRoom].options.usedShapeColors = [];
			}
			
	    // declare myUserType, first user in is a teacher, rest are students
			socket.myUserType = (!roomData[myRoom].teacherInRoom) ? "teacher" : "student";
			myUserType = socket.myUserType;
			
	    // declare myUserId
			myUserId = socket.id;
	    
			// send settings to client
	    socket.emit("save settings", {userType: myUserType, userId: myUserId});

	    // join myRoom
			socket.join(myRoom+"-"+myUserType);
			
	    // tell client intro actions, dependent on myUserType
	    socket.emit("display interface", {userType: socket.myUserType});
	    
			if (myUserType === "teacher") {
	      // remembet that there is already a teacher in room
				roomData[myRoom].teacherInRoom = true;
	      roomData[myRoom].userIdDict["teacher"] = myUserId;
			} else {
	      // action for teacher to take
				socket.to(myRoom+"-teacher").emit("setup student", {userId: myUserId});
			}
		}
	});	
  
	// send the entire state of the world, in this room
  socket.on("update all", function(data) {
    var myRoom = socket.myRoom;
    var userId = data.userId;
		if (roomData[myRoom]) {
    	io.to(userId).emit("send update", {turtles: roomData[myRoom].turtles})
		}
	});
  
	// send only most recent updates of the world, in this room
  socket.on("update", function(data) {
    var myRoom = socket.myRoom;
		var userId;
		var turtleId;
		var turtle;
		var reporterTurtle;
		
		// send update to all students
		socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles});
		
		// send updates to specific students for their NetLogo reporters
		for (var key in data.turtles) 
		{
			turtle = data.turtles[key];
			turtleId = key;
			
			if (turtle.USERID === undefined) {
				userId = roomData[myRoom].userIdDict[turtleId];
				turtle.USERID = userId;
			} else {
				userId = turtle.USERID;
			}
			
			userId = (turtle.USERID === undefined) ? roomData[myRoom].userIdDict[turtleId] : turtle.USERID;
			
			// for each of the turtles, save whole turtle to roomData[myRoom].turtles
			if (roomData[myRoom].turtles[turtleId] === undefined) {
				roomData[myRoom].turtles[turtleId] = turtle;
			}
			
			socket.to(myRoom+"-teacher").emit("show turtle", {turtle: turtle});
			
			// if any of the reporter values are changed, send that to specific student
			// also save that specific updated variable in roomData[roomId].turtles object
			reporterTurtle = {};
			if (turtle.SHAPE != undefined) { reporterTurtle.shape = turtle.SHAPE; roomData[myRoom].turtles[turtleId].SHAPE = turtle.SHAPE; }
			if (turtle.COLOR != undefined) { reporterTurtle.color = turtle.COLOR; roomData[myRoom].turtles[turtleId].COLOR = turtle.COLOR; }
			if (turtle.INFECTED != undefined) {	reporterTurtle.infected = turtle.INFECTED; roomData[myRoom].turtles[turtleId].INFECTED = turtle.INFECTED; } 
			if (turtle.XCOR != undefined) {	reporterTurtle.xcor = turtle.XCOR; roomData[myRoom].turtles[turtleId].XCOR = turtle.XCOR; }
			if (turtle.YCOR != undefined) {	reporterTurtle.ycor = turtle.YCOR; roomData[myRoom].turtles[turtleId].YCOR = turtle.YCOR; }
			if (reporterTurtle != {}) {
				io.to(userId).emit("send update reporters", {turtle: reporterTurtle});
			} 
		}
  });

  //-----------------------//
  // Disease-specific logic
  //-----------------------//
	
	var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
	//world.observer.getGlobal("color-names");
	var colors = [9.9, 35, 55, 45, 116, 96];
	//world.observer.getGlobal("colors");
	var shapeNames =["box", "star", "wheel", "target", "cat", "dog", "butterfly", "leaf", "car", "airplane", "monster", "key", "cow skull", "ghost", "cactus", "moon", "heart"]
	//world.observer.getGlobal("shape-names");
	var maxPossibleCodes = colors.length * shapeNames.length;

	// send netlogo command, that will trigger updates from within netlogo part
  socket.on("change appearance", function() {
    var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (roomData[myRoom]) {
			var myTurtleId = roomData[myRoom].turtleDict[myUserId];
			
			var myBaseShape = roomData[myRoom].turtles[myTurtleId].BASESHAPE;
			var myColor = roomData[myRoom].turtles[myTurtleId].COLOR;
			var myCode = shapeNames.indexOf(myBaseShape) + shapeNames.length + colors.indexOf(myColor);
			var myShape = roomData[myRoom].turtles[myTurtleId].SHAPE;
			var myInfected = roomData[myRoom].turtles[myTurtleId].INFECTED;
			var usedShapeColors = roomData[myRoom].options.usedShapeColors;
			roomData[myRoom].options.usedShapeColors = usedShapeColors.splice(usedShapeColors.indexOf(myCode,1));
			myCode = Math.floor(Math.random() * maxPossibleCodes);
			if (usedShapeColors.length < maxPossibleCodes) {
				while (usedShapeColors.indexOf(myCode) != -1) {
					myCode = Math.floor(Math.random() * maxPossibleCodes);
				}
			}
			roomData[myRoom].options.usedShapeColors.push(myCode);
			var key = myCode % shapeNames.length;
			myBaseShape = shapeNames[key];
			myShape = myBaseShape;
			key = myCode / shapeNames.length;
			myColor = colors[Math.floor(key)];
			if (myInfected) {
	      if (myShape != (myBaseShape + " sick")) { myShape = myBaseShape + " sick"; }
	    }
			var updateTurtles = {};
			var turtle = {};
			turtle.who = myTurtleId;
			turtle.shape = myShape;
			turtle.color = myColor;
			turtle.baseshape = myBaseShape;
			updateTurtles[myTurtleId] = turtle;
			socket.to(myRoom+"-teacher").emit("send update turtles", {turtles: updateTurtles});
		}
	});
  
	socket.on("create student", function(data) {
		var myRoom = socket.myRoom;
		
		var myUserId = data.userId;
		var myTurtleId = data.turtleId;
		if (roomData[myRoom]) {
			roomData[myRoom].turtleDict[myUserId] = myTurtleId;
			roomData[myRoom].userIdDict[myTurtleId] = myUserId;		
			var updateTurtles = {};
			var turtle = {};
			myCode = Math.floor(Math.random() * maxPossibleCodes);
			var usedShapeColors = roomData[myRoom].options.usedShapeColors;
			if (usedShapeColors.length < maxPossibleCodes) {
				while (usedShapeColors.indexOf(myCode) != -1) {
					myCode = Math.floor(Math.random() * maxPossibleCodes);
				}
			}
			roomData[myRoom].options.usedShapeColors.push(myCode);
			var key = myCode % shapeNames.length;
			var myBaseShape = shapeNames[key];
			var myShape = myBaseShape;
			key = myCode / shapeNames.length;
			var myColor = colors[Math.floor(key)];
			turtle.who = myTurtleId;
			turtle.shape = myShape;
			turtle.color = myColor;
			turtle.baseshape = myBaseShape;
			updateTurtles[myTurtleId] = turtle;
			socket.emit("send update turtles", {turtles: updateTurtles});
			io.to(myUserId).emit("send update", {turtles: roomData[myRoom].turtles});
		}
	});
	
	// send world to students, send reporter updates to individual 
	socket.on("change infection chance", function(data) {
		var myRoom = socket.myRoom;
		if (roomData[myRoom]) {
			roomData[myRoom].options.infectionChance = data.infectionChance;
		}
	});
	
	// student pushes buttons, change variables in world on server,
	// send world to students, send reporter updates to individual 
	socket.on("execute move", function(data) {
    var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (roomData[myRoom]) {
			var myTurtleId = roomData[myRoom].turtleDict[myUserId];
			var updateTurtles = {};
			var turtle;
			var max = 10;
			if (myTurtleId != undefined) {
				turtle = {};
				turtle.who = myTurtleId;
				switch (data.heading) {
					case 0:
						if ((Math.abs(roomData[myRoom].turtles[myTurtleId].YCOR + data.stepsize)) <= max) {
							turtle.ycor = roomData[myRoom].turtles[myTurtleId].YCOR + data.stepsize;
						}
						break;
					case 90:
						if ((Math.abs(roomData[myRoom].turtles[myTurtleId].XCOR + data.stepsize)) <= max) {
							turtle.xcor = roomData[myRoom].turtles[myTurtleId].XCOR + data.stepsize;
						}
						break;
					case 180:
						if ((Math.abs(roomData[myRoom].turtles[myTurtleId].YCOR - data.stepsize)) <= max) {
							turtle.ycor = roomData[myRoom].turtles[myTurtleId].YCOR - data.stepsize;
						}
						break;
					case 270:
						if ((Math.abs(roomData[myRoom].turtles[myTurtleId].XCOR - data.stepsize)) <= max) {
							turtle.xcor = roomData[myRoom].turtles[myTurtleId].XCOR - data.stepsize;
						}
						break;
				}
				updateTurtles[myTurtleId] = turtle;
				socket.to(myRoom+"-teacher").emit("send update turtles", {turtles: updateTurtles});
			}
		}
	});
			
	socket.on("check infect", function(data) {
		// find all turtles here
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		if (roomData[myRoom]) {
			var myTurtleId = roomData[myRoom].turtleDict[myUserId];
			var updateTurtles = {};
			var turtle;
			var turtles = roomData[myRoom].turtles;
			var myXcor = roomData[myRoom].turtles[myTurtleId].XCOR;
			var myYcor = roomData[myRoom].turtles[myTurtleId].YCOR;
			var infectionChance = roomData[myRoom].options.infectionChance;
			var turtlesHere = {};
			var infectionHere = roomData[myRoom].turtles[myTurtleId].INFECTED;
			turtlesHere[myTurtleId] = roomData[myRoom].turtles[myTurtleId];
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
								turtle = {};
								turtle.who = turtlesHere[key].WHO;							
							}
							turtle.infected = true;
							turtle.shape = roomData[myRoom].turtles[key].BASESHAPE + " sick";
							updateTurtles[myTurtleId] = turtle;
						}
					} 
	      }
				socket.to(myRoom+"-teacher").emit("send update turtles", {turtles: updateTurtles});
			}	
		}
	});
	
  //------------------------------//
  // End of Disease-specific logic
  //------------------------------//
	
	function clearRoom(roomName) {
		var myRoom = roomName;
		var clientList = [];
		if (roomData[myRoom]) {
			for (var key in roomData[myRoom].userIdDict) {
				clientList.push(roomData[myRoom].userIdDict[key]);
			}
			for (var i=0; i<clientList.length; i++) {
				if (io.sockets.sockets[clientList[i]]) {
					io.to(clientList[i]).emit("display interface", {userType: "disconnected"});
					io.sockets.sockets[clientList[i]].disconnect();
				}
			}
			delete roomData[myRoom];
		}
	}
	
	socket.on("clear room", function(data) {
		var myRoom = data.roomName;
		if (roomData[myRoom]) {
			socket.to(myRoom+"-teacher").emit("display interface", {userType: "disconnected"});
			//socket.to(myRoom+"-student").emit("display interface", {userType: "disconnected"});
			io.sockets.sockets[roomData[myRoom].userIdDict["teacher"]].disconnect();			
		}
	});
	
	// user exits or hubnet exit message
	socket.on('disconnect', function () {
		var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;
		var myUserId = socket.id;
		//console.log(socket.myUserType + " " + myUserId + " disconnected");
		if (socket.myUserType === "teacher") {
			//socket.to(myRoom+"-student").emit("display interface", {userType: "disconnected"});
			clearRoom(myRoom);
		} else {
			if (roomData[myRoom] != undefined) {
				var myTurtleId = roomData[myRoom].turtleDict[myUserId];
				if (roomData[myRoom].turtles[myTurtleId]) {
					var myBaseShape = roomData[myRoom].turtles[myTurtleId].BASESHAPE;
					var myColor = roomData[myRoom].turtles[myTurtleId].COLOR;
					var myCode = shapeNames.indexOf(myBaseShape) + shapeNames.length + colors.indexOf(myColor);
					var usedShapeColors = roomData[myRoom].options.usedShapeColors;
					roomData[myRoom].options.usedShapeColors = usedShapeColors.splice(usedShapeColors.indexOf(myCode,1));
				}
				var updateTurtles = {};
				var turtle = {};
				turtle.who = myTurtleId;
				updateTurtles[myTurtleId] = turtle;
				socket.to(myRoom+"-teacher").emit("remove student", {turtleId: myTurtleId});
				delete roomData[myRoom].turtles[myTurtleId];
			}
		}
	});	
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});

var colorNames = ["white", "brown", "green", "yellow", "purple", "blue"];
//world.observer.getGlobal("color-names");
var colors = [9.9, 35, 55, 45, 116, 96];


function getRoomData() {
	var displayData = "";
	var buttonAction;
	for (var roomKey in roomData) {
		displayData = displayData + "<hr>Which room? " + roomKey;
		displayData = displayData + "<br> Is there a teacher? ";
		displayData = roomData[roomKey].teacherInRoom ? displayData + " yes": displayData + " no";
		displayData = displayData + "<br> Students?";
		if (roomData[roomKey].turtles != {}) {
			for (var turtleKey in roomData[roomKey].turtles) {
				var turtle = roomData[roomKey].turtles[turtleKey];
				if ((turtle.WHO != "-1") && (turtle.BREED === "STUDENTS")) {
					var colorName = (colors.indexOf(turtle.COLOR) > -1) ? colorNames[colors.indexOf(turtle.COLOR)] : "";
					displayData = displayData + "<br>";
					displayData = displayData + "Turtle " + turtle.WHO + " is a " + colorName + " " + turtle.SHAPE;
					displayData = displayData + " at (" + turtle.XCOR + ", " + turtle.YCOR + ")";
					displayData = displayData + " with userId " + turtle.USERID;
				}
			}
		}
		displayData = displayData + "<br><button onclick=Interface.clearRoom('"+roomKey+"')>Clear Room</button>";
	}
	return displayData;
}
