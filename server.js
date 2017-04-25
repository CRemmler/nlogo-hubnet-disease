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
		
		// declare myRoom
		socket.myRoom = data.room;
		var myRoom = socket.myRoom;
		if (!roomData[myRoom]) {
			roomData[myRoom] = {};
			roomData[myRoom].teacherInRoom = false;
			roomData[myRoom].turtles = {};
			roomData[myRoom].turtleDict = {};
			roomData[myRoom].userIdDict = {};
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
		
		// tell teacher or student to display their interface
		socket.emit("display interface", {userType: socket.myUserType});
    
		if (myUserType === "teacher") {
			// remembet that there is already a teacher in room
			roomData[myRoom].teacherInRoom = true;
			roomData[myRoom].userIdDict["teacher"] = myUserId;
		} else {
			// send teacher a hubnet-enter-message
			socket.to(myRoom+"-teacher").emit("execute command", {hubnetMessageSource: myUserId, hubnetMessageTag: "hubnet-enter-message", hubnetMessage: ""});
		}
	});	
  
	// send only most recent updates of the world, in this room
  socket.on("update", function(data) {
		var myRoom = socket.myRoom;
		var userId;
		var turtleId;
		var turtle;
		var reporterTurtle;
		
		// send update to each student
		for (var key in data.turtles) 
		{
			turtle = data.turtles[key];
			turtleId = key;
			if (roomData[myRoom].turtles[turtleId] === undefined) {
				//send world to new students
				userId = turtle.USERID;
				roomData[myRoom].turtleDict[userId] = turtleId;
				roomData[myRoom].userIdDict[turtleId] = userId;	
				roomData[myRoom].turtles[turtleId] = turtle;
				io.to(userId).emit("send update", {turtles: roomData[myRoom].turtles})
			} 
			//send current updates to old students
			socket.to(myRoom+"-student").emit("send update", {turtles: data.turtles});

		}
  });
	
	// pass command from student to teacher
	socket.on("send command", function(data) {
		var myRoom = socket.myRoom;
		var myUserId = socket.id;
		socket.to(myRoom+"-teacher").emit("execute command", {
			hubnetMessageSource: myUserId,
			hubnetMessageTag: data.hubnetMessageTag,
			hubnetMessage: data.hubnetMessage
		});
	});
	
	// pass reporter from teacher to student
	socket.on("send reporter", function(data) {
		var userId = data.hubnetMessageSource;
		io.to(userId).emit("display reporter", {
			hubnetMessageSource: userId,
			hubnetMessageTag: data.hubnetMessageTag,
			hubnetMessage: data.hubnetMessage
		});
	});
	
	// if teacher leaves room, disconnect all students from room
	socket.on("clear room", function(data) {
		var myRoom = data.roomName;
		if (roomData[myRoom]) {
			socket.to(myRoom+"-teacher").emit("display interface", {userType: "disconnected"});
			io.sockets.sockets[roomData[myRoom].userIdDict["teacher"]].disconnect();			
		}
	});
	
	// user exits 
	socket.on('disconnect', function () {
		var myRoom = socket.myRoom;
		var myTurtleId = socket.myTurtleId;
		var myUserId = socket.id;
		if (socket.myUserType === "teacher") {
			clearRoom(myRoom);
		} else {
			if (roomData[myRoom] != undefined) {
				var myTurtleId = roomData[myRoom].turtleDict[myUserId];
				var updateTurtles = {};
				var turtle = {};
				turtle.who = myTurtleId;
				updateTurtles[myTurtleId] = turtle;
				socket.to(myRoom+"-teacher").emit("execute command", {
					hubnetMessageSource: myUserId, 
					hubnetMessageTag: "hubnet-exit-message", 
					hubnetMessage: ""
				});
				delete roomData[myRoom].turtles[myTurtleId];
			}
		}
	});	
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT );
});

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