var dbInfo = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'druk'
}

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var mysql = require("mysql");

var roomData = require("roomdata");



var con = mysql.createConnection(dbInfo);


con.connect(function (error) {
   if(error) console.log(error.stack);
});;


app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
    app.use(express.static(__dirname + '/public'));
//    res.render(__dirname + "/public/index.html");
});

//app.use(express.static(__dirname + '/public'));



http.listen(3000, function () {
  console.log('Example appss listening on port 3000!')
});




io.on('connection', function(socket) {
    
    socket.on("send msg", function(msg) {
        if(msg.substring(0, 1)!="/") {
            //Brugeren forsøger ikke at udføre en kommando, så vi sender istedet beskeden:
            io.to(socket.currentRoom).emit("chatMsg", msg, socket.playerNr);
            con.query("INSERT INTO chatlog(lobby_id, player_id, message) VALUES(?, ?, ?)", [socket.currentRoom, socket.playerNr, msg], function(error, results, fields) {
                if(error) throw error;
            });
        } else {
            //Udfør kommando, hvis den findes. Ellers emit tilbage til brugeren, at kommandoen ikke kunne forstås.
            switch(msg.substring(1)) {
                case "start":
                    con.query("UPDATE lobbies SET started='true' WHERE id=?", [socket.currentRoom], function(error, results, fields) {
                        if(error) throw error;
                    })
                    
                    roomData.get(socket, "clients").forEach(function(usr) {
                        io.to(usr.id).emit("startGame", usr.playerNr);
                        io.to(usr.id).emit("chatMsg", "Spillet er påbegyndt. Du er tildelt spiller #" + usr.playerNr);
                        
                    });
                break;
            }
        }



    });

    socket.on("errors", function(msg) {
        console.log("Error: " + msg);
    });

    socket.on("resend", function(fnc, cmd1, cmd2) {
        var predefinedFnc = ["errors", "connection", "join", "disconnect"];

        var legal = true;
        predefinedFnc.forEach(function(el) {
            if(fnc==el) {
                legal = false;
            }
        });
        if(legal) {
            console.log("resending " + fnc + ", to room:" + socket.currentRoom + "with cmd1: " + cmd1 + " & cmd2: " + cmd2);
            io.to(socket.currentRoom).emit(fnc, cmd1, cmd2);
            con.query("INSERT INTO gamelog(lobbyid, player, fnc, cmd1, cmd2) VALUES(?, ?, ?, ?, ?)", [socket.currentRoom, socket.playerNr, fnc, cmd1, cmd2], function(error, results, fields) {
                if(error) throw error;
            });

        } else {
            console.log("illegal resend call: " + fnc);
        }
    });


    socket.on("join", function(room, game) {

        game = parseInt(game);
        room = parseInt(room);
        console.log("join game " + game + "," + room);
        con.query("SELECT * FROM lobbies WHERE id=?", [room], function(error, results, fields) {
            if(error) throw error;
            if(!results.length) {
                if(createLobby(room, game)) {
                    socket.playerNr = 1;
                    socket.currentRoom = room;
                    socket.emit("joined", game, room, 1);
                } else {
                    socket.emit("errors", "couldn't make lobby")
                }



            } else {
                results = results[0];
                if(results.max_players==results.current_players) {
                    socket.emit("errors", "lobby is full");
                } else if(results.started=="true") {
                    socket.emit("errors", "game is started");
                } else {
                    var players = parseInt(results.current_players)+1
                    con.query("UPDATE lobbies SET current_players=?", [players], function(error, results, fields) {
                        if(error) throw error;
                        socket.emit("joined", game, room, players);
                        io.to(room).emit("updatePlayers", players);
                        socket.currentRoom = room;
                        socket.playerNr = players;
                    })
                }




            }
        });

        roomData.joinRoom(socket, room); // socket.join(room);
        var socketList = roomData.get(socket, "clients") || new Array();
        socketList.push(socket);
        roomData.set(socket, "clients", socketList);
    });


    socket.on('disconnect', function() {
        if(socket.currentRoom) {
            room = socket.currentRoom;
            io.to(room).emit("player left: ")
            con.query("SELECT * FROM lobbies WHERE id=?", [room], function(error, results, fields) {
                if(error) throw error;
                results = results[0];
                //Hvis der kun findes 1 spiller i rummet, slettes dette når spilleren forlader det.
                if(results.current_players===1) {
                    con.query("DELETE FROM lobbies WHERE id=?", [room], function(error, results, fields) {
                        if(error) throw error;
                    });
                } else {
                    con.query("UPDATE lobbies SET current_players=? WHERE id=?", [results.current_players-1, room], function(error, results, fields) {
                        if(error) throw error;
                    });
                    
                }
            });
        }

    });



});


function createLobby(room, game) {
    var success = true;
    console.log("creating lobby with gameid " + game)
    //Get game info:
    con.query("SELECT id, min_players, max_players AS id, min_players, max_players FROM games WHERE id=?", [game], function(error, results, fields) {
        if(error) throw error;
        if(!results.length) {
            console.log("no gameid matching");
            success = false;
        }
        results = results[0];
        

        con.query("INSERT INTO lobbies (id, min_players, max_players, current_players, game_id, started) VALUES (?, ?, ?, ?, ?, ?)",
            [room, results.min_players, results.max_players, 1, game, "false"], function(error, results, fields) {
                if(error) throw error;
                console.log("lobby created with id " + room + ", game " + game);
            });
    });
    return success;
}



//Fra stackOverflow:
function findClientsSocket(roomId) {
  var res = [],
      room = io.sockets.adapter.rooms[roomId];
  if (room) {
    for (var id in room) {
      res.push(io.sockets.adapter.nsp.connected[id]);
    }
  }
  return res;
}