var ws = new WebSocket("ws://localhost:3000");

ws.addEventListener("open", function(evt) {
  console.log('connected');
  //document.write("connected...<br>")
});

ws.addEventListener("message", function(msg) {
  console.log(msg.data);
  var ul = document.querySelector("#messages")
  var li = document.createElement("li")
  ul.insertBefore(li, ul.firstChild)
  var msgobj = JSON.parse(msg.data);
  console.log(msg.data)
    if (msgobj.type === "data") {
      var ul = document.querySelector("#status")
      var li = document.createElement("li")
      li.innerHTML = msgobj.name + "= " + msgobj.msg
      ul.appendChild(li);
    }
    else {
      li.innerHTML = msgobj.name + ": " + msgobj.msg
    }

});

var button = document.querySelector("#submit")
console.log(button);
button.addEventListener("click", function() {
  var input = document.querySelector("#chat")
  var message = JSON.stringify({name: "browser", msg: input.value, type: "msg"})
  ws.send(message);
});

// if (JSON.parse(msg).type = "data") {
//    // li element set to parse > name + msg
// }
