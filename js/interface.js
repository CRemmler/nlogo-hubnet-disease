Interface = (function() {

  //////////////////////////////////////////
  // DISEASE - Client Buttons and Sliders //
  //////////////////////////////////////////
  // items are NetLogo interface components like button, slider...
  var itemId = {
    "teacherItems": 0,    // teacher items have id's from 0-20
    "studentItems": 21,   // student items have id's from 21-29
    "loginItems": 30,     // login items have id's from 30-42
    "totalItems": 43
  }
  var createRoomButton = "32";
  var createRoomInput = "30";
  /////////
  // END //
  /////////

  var items = {};
  
  function displayLoginInterface(rooms) {
    setupItems();
    $(".netlogo-tab-area").addClass("hidden");
    $(".netlogo-export-wrapper").css("display","none");   
    $(".netlogo-speed-slider").css("display","none");
    $(".admin-body").css("display","inline");
    showItems(itemId.loginItems,itemId.totalItems);
    
    $("#netlogo-button-"+createRoomButton).addClass("create-room-button");
    $(".netlogo-button:not(.hidden):not(.create-room-button)").addClass("join-room-button");
    $("#netlogo-inputBox-30 textarea").addClass("create-room-input");
    $(".join-room-button").addClass("hidden");
    
    var roomButtonHtml, roomButtonId;
    for (var i=0; i<rooms.length; i++) {
      roomButtonHtml = "<div class='netlogo-button-agent-context'>"+
        "<span class='netlogo-label'>"+rooms[i]+"</span></div>";
      roomButtonId = "#netlogo-button-"+(itemId.loginItems+3+i);
      $(roomButtonId).html(roomButtonHtml);
      $(roomButtonId).removeClass("hidden");
    }
  }

  function displayTeacherInterface(room) {
    showItems(itemId.teacherItems, itemId.studentItems);
    $("#netlogo-title").append(" Room: "+room);
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-tab-area").removeClass("hidden");
    $(".admin-body").css("display","none");
  }
  
  function displayStudentInterface(room) {
    showItems(itemId.studentItems, itemId.loginItems);
    $("#netlogo-title").append(" Room: "+room);
    $(".netlogo-view-container").removeClass("hidden");
    $(".admin-body").css("display","none");
    $(".netlogo-button:not(.hidden)").addClass("student-button");
  }
  
  function displayDisconnectedInterface() {
    $(".admin-body").css("display","inline");
    $(".admin-body").html("You have been disconnected. Please refresh the page to continue.");
  }
  
  function displayAdminInterface(rooms) {
    $("#noRoomsChosen").css("display","none");
    $("#netlogo-model-container").addClass("hidden");
    $("#admin-data").html(rooms);
  }
  
  function clearRoom(roomName) {
    socket.emit("clear room", {roomName: roomName});
    //$("#submitRoomString").trigger("click");
  }
  
  function setupItems() {
    var key, value, id;
    $(".netlogo-widget").each(function() {
      id = $(this).attr("id");
      if (id) { 
        key = parseInt(id.replace(/\D/g,''));
        if (key) {
          value = id;
          items[key] = value;
        }
      }
    });
  }

  function showItems(min, max) {
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-model-title").removeClass("hidden");
    for (var i=min; i<max; i++) {
      $("#"+items[i]).removeClass("hidden");
    }
  }

  return {
    showLogin: displayLoginInterface,
    showTeacher: displayTeacherInterface,
    showStudent: displayStudentInterface,
    showDisconnected: displayDisconnectedInterface,
    showAdmin: displayAdminInterface,
    clearRoom: clearRoom
  };

})();