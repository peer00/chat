var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port: 3000});

var userDb = [];

var chatHistoryDb = [];

server.on("connection", function(obj){
  var userid = {name: "",status: "", user: obj};
  userDb.push(userid);
  userid.user.send(JSON.stringify(jsonMsg("server","Choose your username please","msg")));

  userDb.forEach(function(userobj) {
    if (userobj.user !== userid.user) {
      userobj.user.send(JSON.stringify(jsonMsg("server","Client Connected","msg")));
    }
  });

  userid.user.on("message", function(message) {

    if (userid.name === "") {
      usermsg = JSON.parse(message);
      userid.name = usermsg.msg;

      userid.status = "online" //setting the user "online"
      userDb.forEach(function(userobj) {
        userobj.user.send(JSON.stringify(jsonMsg(userid.name,userid.status,"data")));
      });

      chatHistoryDb.forEach(function(each) {  // send chat history to user when he logs on
        userid.user.send(each)
      });
    }

    else {

      chatHistory(message); // put each message in chat history

      if ( privateCheck(message) ) { // check if /p option is used to send private message
        privateSend(message); // send private message to user
      }

      else {
        console.log(userDb)
        userDb.forEach(function(userobj) {
            msgObj = JSON.parse(message);
            userobj.user.send(JSON.stringify(jsonMsg(userid.name,msgObj.msg,msgObj.type)));
        });
      }

    }
  }); //on message

  userid.user.on("close", function() {
    offline();
  });



///////////////////////FUNCTIONS//////////////////////////////
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
}

}); //close of server.on

var privateCheck = function (message) {
  var parsed = JSON.parse(message);
  if (parsed.msg.slice(0,2) === "/p") {
  return true;
  }
};

var jsonMsg = function(nm,ms,tp) {
  var obj = {name: nm, msg: ms, type: tp}
  return obj;
}
