var socket = io(window.location.href).connect();
var gameID;

$(document).ready(function() {
    gameID = getUrlParameter("g");
    if(!gameID) {
        gameID = promtInfo("No game ID was found; please enter one");
        window.location.hash += "&g=" + gameID;
    }

    lobbyID = getUrlParameter("l");
    if(!lobbyID) {
        lobbyID = promtInfo("No lobby ID was found; please enter one");
        window.location.hash += "&l=" + lobbyID;
    }
    
    
    console.log("emitting join, " + lobbyID + ", " + gameID);
    socket.emit("join", lobbyID, gameID);
});

socket.on("updatePlayers", function(players) {
    $("#player_status").html(players);
})

socket.on("joined", function(game, room, players) {
    //Det lykkedes os at tilslutte en lobby, så vi indlæser nu det nødvendige spil fra ./games/:id:
    console.log("Joined " + game + " in room " + room);
    $.getScript('games/'+game+"/main.js");
    $.getScript('chat.js');
    $("#player_status").html(players);
});


socket.on("errors", function(msg) {
    alert("Something went wrong... Error message: " + msg);
})

function promtInfo(msg) {
    var id;
    while(id=="NaN" || id=="" || !id) {

        var id = parseInt(prompt(msg, ""));
    }
    return id;
    
}

//Fra stack overflow:
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
