$("#chatinput").keypress(function(key) {
    if(key.which==13) { //Enter er trykket:
        sendMsg();

    }

})

$("#sendbtn").click(function() {
    sendMsg();
})



function sendMsg() {
    var msg = $("#chatinput").val();
    $("#chatinput").val(""); //Clear
    socket.emit("send msg", msg);

}

socket.on("chatMsg", function(msg, sender) {
    
    var chatcont = $('#chatcont');
    if(sender)
        var msg = "<span class='newMessage'>Player " + sender + ": " + msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span><br />";
    else
        var msg = "<span class='newMessage'>" + msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span><br />";


    $("#chatcont").html($("#chatcont").html() + msg);

    chatcont.scrollTop(chatcont.get(0).scrollHeight);

});