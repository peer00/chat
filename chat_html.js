var ws = new WebSocket("ws://localhost:3000");

ws.addEventListener("open", function(evt) {
  console.log('connected');
  //document.write("connected...<br>")
});

var statusList = [];

ws.addEventListener("message", function(msg) {

  var msgobj = JSON.parse(msg.data);
  var msgobjArray = msgobj.msg.split(".");

  var imageCheck = function (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === "jpg" || array[i] === "bmp" || array[i] === "gif") {
        return true;
      }
    };
  };

    if (msgobj.type === "data" && msgobj.msg === "online") {
      var ul = document.querySelector("#status")
      var li = document.createElement("li")
      statusList.push(li);
      li.innerHTML = msgobj.name;
      ul.appendChild(li);
    }

    else if (msgobj.type === "data" && msgobj.msg === "offline") {
      var listAll = document.querySelectorAll("li");
      statusList.forEach(function(list) {
        if (list.innerHTML === msgobj.name) {
          list.remove();
        }
      });
    }

    else if ( imageCheck(msgobjArray) )  {
      var ul = document.querySelector("#messages")
      var li = document.createElement("li")
      var img = document.createElement("img");
      img.src = msgobj.msg
      img.height = "150";
    //  li.innerHTML = msgobj.msg
      ul.insertBefore(li, ul.firstChild)
      li.appendChild(img)
    }

    else if (msgobj.msg.slice(0,7) === "http://" || msgobj.msg.slice(0,3) === "www") {
      var ul = document.querySelector("#messages")
      var li = document.createElement("li")
      var a = document.createElement("a");
      a.href = msgobj.msg
      a.innerHTML = msgobj.msg
      ul.insertBefore(li, ul.firstChild)
      li.appendChild(a)
    }


    else {
      var ul = document.querySelector("#messages")
      var li = document.createElement("li")
      ul.insertBefore(li, ul.firstChild)
      li.innerHTML = msgobj.name + ": " + msgobj.msg
    }


});

var input = document.querySelector("#chatbox")

var button = document.querySelector("#submit")
console.log(button);
button.addEventListener("click", function() {
  var message = JSON.stringify({name: "browser", msg: input.value, type: "msg"})
  ws.send(message);
});

input.addEventListener("keyup", function(evt){
  if (evt.keyCode === 13) {
    var message = JSON.stringify({name: "browser", msg: input.value, type: "msg"})
    ws.send(message);
    input.value = "";
  }
})


// if (JSON.parse(msg).type = "data") {
//    // li element set to parse > name + msg
// }
