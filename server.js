var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});

var userDb = [];

var chatHistoryDb = [];

server.on("connection", function(obj){
  var userid = {name: "",status: "", password: "", user: obj};
  userDb.push(userid);
  userid.user.send(JSON.stringify(jsonMsg("server","Choose your username please","msg")));

  userDb.forEach(function(userobj) {
    if (userobj.user !== userid.user && userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg("server","Client Connected","msg")));
    }
  });

  userid.user.on("message", function(message) {

    if (userid.name === "") {
      usermsg = JSON.parse(message);
      userid.name = usermsg.msg;

      userid.status = "online" //set the new user "online"

      offlineOnline(); //tell everybody who's online and offline

      sendChatHistory(); //send all the chathistory to the user

    }

    else {

      chatHistory(message); // put each message in chat history

      if ( privateCheck(message) ) { // check if /p option is used to send private message
        privateSend(message); // send private message to user
      }

      else if ( wickedMessageCheck(message) )  { // check if /wicked is used
        wickedMessageSend(); // send "jungle is massive" to everybody
      }

      else if ( kickCheck(message) )  { // check if /kick is used
        kickUser(message); // kick user from chat
      }

      else if ( userCheck(message) )  { // check if /user is used
        setUser(message); // set new user in object
      }

      else {
        console.log(userDb)
          userDb.forEach(function(userobj) {
            if (userobj.status === "online") {
              msgObj = JSON.parse(message);
              userobj.user.send(JSON.stringify(jsonMsg(userid.name,msgObj.msg,msgObj.type)));
              }
            });
      }

    }
  }); //on message

  userid.user.on("close", function() {
    offline();
  });



///////////////////////FUNCTIONS//////////////////////////////

var sendChatHistory = function() {
  chatHistoryDb.forEach(function(each) {  // send chat history to user when he logs on
    userid.user.send(each)
  });
};

var offline = function() {
  userid.status = "offline" //setting the user "offline"
  userDb.forEach(function(userobj) {
    if (userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg(userid.name,userid.status,"data")));
    }
  });
}

var chatHistory = function(msg) { // put each message in chat history
  var msgObj = JSON.parse(msg)
  msgObj2 = JSON.stringify(jsonMsg(userid.name,msgObj.msg,"msg"));
  chatHistoryDb.push(msgObj2);
}


var privateSend = function(pmsg) {
  var msgObj = JSON.parse(pmsg)
  var msgArray = msgObj.msg.split(" ");
  var userP = msgArray[1];
  msgArray.splice(0,2);
  var msg = msgArray.join(" ");

  userDb.forEach(function(userobj) {
    if (userobj.name === userP) {
      userobj.user.send(JSON.stringify(jsonMsg(userid.name,msg,"msg")));  //verder invullen (eigen naam)
      userid.user.send(JSON.stringify(jsonMsg(userid.name,msg,"msg")));
    }
  });
};

var kickUser = function(msg) {
  var msgObj = JSON.parse(msg)
  var msgArray = msgObj.msg.split(" ");
  var userP = msgArray[1];

  userDb.forEach(function(userobj) {
    if (userobj.name === userP) {
      userobj.user.close();
    }
  });
};

var setUser = function(msg) {
  var msgObj = JSON.parse(msg)
  var msgArray = msgObj.msg.split(" ");
  var userP = msgArray[1];
  var passW = msgArray[2];

  userDb.forEach(function(userobj) {
    if (userobj.name === userP && userobj.password === "") {
      userobj.password = passW;
    }
    else if (userobj.name === userP && userobj.password !== "") {
      userid.user.send(JSON.stringify(jsonMsg(userid.name,wmsg,"that is not allowed"))); 
    }
  });
};

var wickedMessageSend = function () {
  wmsg = "Jungle is MASSIVE!!"
  userDb.forEach(function(userobj) {
    if (userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg(userid.name,wmsg,"msg")));  //verder invullen (eigen naam)
    }
  });
};


var offlineOnline = function() {
  userDb.forEach(function(userobj) {
    if (userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg(userid.name,userid.status,"data")));
      if (userobj !== userid) {
        userid.user.send(JSON.stringify(jsonMsg(userobj.name,userid.status,"data")));
      }
    }
  });
};

}); //close of server.on

var privateCheck = function (msgs) {
  var parsed = JSON.parse(msgs);
  if (parsed.msg.slice(0,2) === "/p") {
  return true;
  }
};

var wickedMessageCheck = function (msgs) {
  var parsed = JSON.parse(msgs);
  if (parsed.msg.slice(0,7) === "/wicked") {
    return true;
  }
};

var kickCheck = function (msgs) {
  var parsed = JSON.parse(msgs);
  if (parsed.msg.slice(0,5) === "/kick") {
    return true;
  }
};

var userCheck = function (msgs) {
  var parsed = JSON.parse(msgs);
  if (parsed.msg.slice(0,5) === "/user") {
    return true;
  }
};

var jsonMsg = function(nm,ms,tp) {
  var obj = {name: nm, msg: ms, type: tp}
  return obj;
}
