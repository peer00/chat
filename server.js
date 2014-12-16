var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});

var userDb = [];

var chatHistoryDb = [];

server.on("connection", function(obj){
  var userid = {name: "",status: "", password: "", user: obj};
  userDb.push(userid);
  userid.user.send(JSON.stringify(jsonMsg("server","Choose your username please","msg")));
  userid.status = "online";

  userDb.forEach(function(userobj) {
    if (userobj.user !== userid.user && userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg("server","Client Connected","msg")));
    }
  });

  userid.user.on("message", function(message) {

    if (userid.name === "") {

        userid.user.send(JSON.stringify(jsonMsg("server","set your username with /user \"user\" \"password\" or Log on","msg")));
        setUser(message);
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



///////////////////////FUNCTIONS////////////////////////////

var sendChatHistory = function() {
  chatHistoryDb.forEach(function(each) {  // send chat history to user when he logs on
    userid.user.send(each)
  });
};

var offline = function() {
  userid.status = "offline" //setting the user "offline"
  userDb.forEach(function(userobj) {
    if (userobj.status === "online") {
      userobj.user.send(JSON.stringify(jsonMsg("server",userid.status,"data")));
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

var userExist = function(x) {
  for (var i = 0; i < userDb.length; i++) {
    if (userDb[i].name === x) {
      return true;
    }
  };
  return false;
}

var userAuth = function(x,y) {
  for (var i = 0; i < userDb.length; i++) {
    if (userDb[i].name === x && userDb[i].password === y) {
      return true;
    }
  };
  return false;
}

var setUser = function(msg) {
  var msgObj = JSON.parse(msg)
  var msgArray = msgObj.msg.split(" ");
  var userP = msgArray[1].trim();
  var passW = msgArray[2].trim();

  if (userExist(userP) === false && userCheck(msg) === true) {
    userid.name = userP;
    userid.password = passW;
    userid.user.send(JSON.stringify(jsonMsg("server","user and password have been set","msg")));
    userid.status === "online"
    offlineOnline(); //tell everybody who's online and offline
    sendChatHistory(); //send all the chathistory to the user

  }
  else if (userLogon(msg) === true && userExist(userP) === true && userAuth(userP,passW) === true) {
    userid.name = userP;
    userid.password = passW;
    userid.user.send(JSON.stringify(jsonMsg("server","Welcome back!","msg")));
    userid.status === "online"
    offlineOnline(); //tell everybody who's online and offline
    sendChatHistory(); //send all the chathistory to the user
  }

  else {
    userid.user.send(JSON.stringify(jsonMsg("server","that is not allowed","msg")));
  }


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
      if (userobj.user !== userid.user && userid.status === "online") {
      userid.user.send(JSON.stringify(jsonMsg(userobj.name,userobj.status,"data")));
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
  else {
    return false;
  }
};

var userLogon = function (msgs) {
  var parsed = JSON.parse(msgs);
  if (parsed.msg.slice(0,6) === "/logon") {
    return true;
  }
  else {
    return false;
  }
};

var jsonMsg = function(nm,ms,tp) {
  var obj = {name: nm, msg: ms, type: tp}
  return obj;
};
