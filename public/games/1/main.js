var alph = "ABCDEFGH"
var currentTurn = "white";
var currentFocus; //sidste brik spilleren klikkede på
var highlighted = new Array();; //Array med tiles som highlightes af legalMoves()

var player = "white";

$(document).ready(function() {
    //Intet sker sådan ummidelbart:
});


jQuery.fn.clear = function() {
    $(this).removeClass($(this).data("piece")+"-"+$(this).data("owner"));
    $(this).removeData("piece");
    $(this).removeData("owner");
    $(this).html(" ");
}  



jQuery.fn.setPiece = function(item, owner) 
{
    $(this).addClass(item+"-"+owner);
    $(this).data("piece", item);
    $(this).data("owner", owner);
    

    $(this).html("<img src='/resources/"+owner+"_"+item+".png' class='pieceImage'></img>");

    return null;
};  


function initGame() {
    /*
     *  Generer brættet:
     * 
     */

    var _tileColor = 0; //0 = white; 1 = black
    var alph = "ABCDEFGH"


    var tileHTML = $("<div id='none' class='block'></div>");

    for(var _y = 8; _y > 0; _y--) {
        $("#board").append("<div class='row' id='row" + _y + "'></div>")
        for(var _x = 0; _x < 8; _x++) {
            if(_y%2==_x%2)
                _tileColor = 0;
            else
                _tileColor = 1;
            
            var _id = alph.substring(_x, _x+1) + "" + _y;
            _tileHTML = tileHTML.clone().attr("id", _id).addClass("tile-"+_tileColor).click(function() {
                tileClicked($(this));
            });
            $("#row"+_y).append(_tileHTML);
        }
    }



    //Sæt bønderer:    
    $("#row7").children().setPiece("pawn", "black");
    $("#row2").children().setPiece("pawn", "white");


    //Sæt tårnene:
    $("#A8, #H8").setPiece("rook", "black");
    $("#A1, #H1").setPiece("rook", "white");
    
    //Sæt springere:
    $("#B8, #G8").setPiece("knight", "black");
    $("#B1, #G1").setPiece("knight", "white");
    

    //Og løbere:
    $("#C8, #F8").setPiece("bishop", "black");
    $("#C1, #F1").setPiece("bishop", "white");
    
    //Dronningen:
    $("#D8").setPiece("queen", "black");
    $("#D1").setPiece("queen", "white");
    
    //Kongen:
    $("#E8").setPiece("king", "black");
    $("#E1").setPiece("king", "white");
    

}

function ioMove(from, to) {
    //Skift fra board ID til jQuery objekter:
    toTile = $("#" + to);
    fromTile = $("#" + from);
    moves = getLegalMoves(fromTile);
    
    isLegit = false;

    moves.forEach(function(el) {
        if(el==to)
            isLegit = true;
    });

    if(fromTile.data("owner")!=currentTurn) {
        alert("error! turn mismatch");
        socket.emit("errors", "client mismatch -- currentTurn");
        return;
    }

    if(isLegit) {
        toTile.setPiece(fromTile.data("piece"), currentTurn);
        fromTile.clear();
        currentTurn = (currentTurn!="white") ? "white" : "black";
        return;
    } else {
        socket.emit("errors", "client mismatch -- legal moves");
        return;
    }

}


socket.on("movePiece", function(from, to) {
    //Anmodning om at flytte:
    //alert("move: " + from + " " + to)
    ioMove(from, to);
});

socket.on("startGame", function(nr) {
    if(nr==1)
        player = "white";
    if(nr==2)
        player = "black";
    initGame();
})

function movePiece(newTile) {
    socket.emit("resend", "movePiece", currentFocus.attr("id"), newTile.attr("id"));
/*
    newTile.setPiece(currentFocus.data("piece"), currentTurn);
    currentFocus.clear();
    
    currentTurn = (currentTurn!="white") ? "white" : "black";
    player = (player!="white") ? "white" : "black";
*/

}


function tileClicked(tile) {
    for(_tile in highlighted) {
        $("#"+highlighted[_tile]).removeClass("highlighted");
    }




    if($.inArray(tile.attr("id"), highlighted)>-1) {
        //Tile er en del af highlighted, og derfor et lovligt træk, så ryk brikken:
        movePiece(tile);
        for(_tile in highlighted) {
            $("#"+highlighted[_tile]).removeClass("highlighted");
        }
        highlighted = [];
        return;
    }
    
    if($(tile).data("owner")!=player || player!=currentTurn)
        return;
        

    currentFocus = tile;


    highlighted = getLegalMoves(tile);
    
    for(_tile in highlighted) {
        
        $("#"+highlighted[_tile]).addClass("highlighted");
    }


}


function getLegalMoves(tile) {
    var owner = tile.data("owner");
    var direction = (owner=="white") ? 1 : -1;
    var legalMoves = new Array();

    var x = tile.attr("id").substring(0, 1);
    var y = parseInt(tile.attr("id").substring(1, 2));
    switch(tile.data("piece")) {
        case "pawn":
            switch(owner) {
                case "white":
                    //Hvis bonden ikke er rykket:
                    if(y=="2") {
                        if($("#"+x+""+4).data("piece")==null){
                            legalMoves.push(x+"4");
                        }
                    }
                break;
                case "black":
                    if(y=="7") {
                        if($("#"+x+""+5).data("piece")==null)
                            legalMoves.push(x+""+5);
                    }
                break;
            }
            for(i=-1; i<=1; i++) {
                xPos = alph.indexOf(x);
                if(xPos==0 && i==-1)
                    continue;
                else if(xPos==7 && i==1)
                    continue;
                _x = alph.substring(xPos+i, xPos+i+1);

                if(i==0 && $("#"+x+(parseInt(y)+direction)).data("piece")==null) 
                    legalMoves.push(x+""+(parseInt(y)+direction));
                else if(i!=0 && $("#"+_x+(parseInt(y)+direction)).data("owner")!=owner && $("#"+_x+(parseInt(y)+direction)).data("piece")!=null)
                    legalMoves.push(_x+""+(parseInt(y)+direction))
            }
        break;

        case "knight":
            _x = -2;
            _y = 0; //+/- 1
            xPos = alph.indexOf(x)+_x;
            
            if(xPos>=0) {
                _x = alph.substring(xPos, xPos+1);
                _y = y+1;
                
                if(_y<=8) {
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }

                _y = y-1;
                if(_y>0) {
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
            }

            _x = 2;
            _y = 0; //+/- 1
            
            xPos = alph.indexOf(x)+_x;
            
            if(xPos<8) {
                _x = alph.substring(xPos, xPos+1);
                _y = y+1;
                if(_y<=8) {
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
                _y = y-1;
                if(_y>0) {
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
            }

            _x = 0; // +/- 1
            _y = y+2;
            
            if(_y<=8) {
                xPos = alph.indexOf(x)-1;
                if(xPos>=0) { 
                    _x = alph.substring(xPos, xPos+1);
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
                
                xPos = alph.indexOf(x)+1;
                if(xPos<8) { 
                    _x = alph.substring(xPos, xPos+1);
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
            }


            
            _x = 0; // +/- 1
            _y = y-2;
            
            if(_y>0) {
                xPos = alph.indexOf(x)-1;
                if(xPos>=0) { 
                    _x = alph.substring(xPos, xPos+1);
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
                
                xPos = alph.indexOf(x)+1;
                if(xPos<8) { 
                    _x = alph.substring(xPos, xPos+1);
                    if($("#"+_x+""+_y).data("piece")==null || ($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null)) {
                        legalMoves.push(_x+_y);
                    }
                }
            }
            
        break;

        case "rook":    
            //tjek i retning x-n (venstre):
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;

                _x = alph.substring(xPos, xPos+1);
                _y = y;
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            //tjek i retning x+n (højre):
            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;

                _x = alph.substring(xPos, xPos+1);
                _y = y;
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            //tjek i y-n
            for(i=-1; i>-8; i--) {
                
                _y = y+i;
                if(_y<1) //Hold op med at tjekke ude for brættet:
                    break;

                _x = x
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            
            for(i=1; i<8; i++) {
                
                _y = y+i;
                if(_y>8) //Hold op med at tjekke ude for brættet:
                    break;

                _x = x
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
        break;

        case "bishop":
            //tjek i retning x-n; y-n (venstre):
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                _y = y+i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y<1) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
            
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                _y = y-i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y>8) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }


            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                _y = y+i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y>8) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
            
            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                _y = y-i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y<1) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            
            



        break;

        case "queen":
            
            
            
            //tjek i retning x-n (venstre):
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;
                
                _x = alph.substring(xPos, xPos+1);
                _y = y;
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            //tjek i retning x+n (højre):
            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;

                _x = alph.substring(xPos, xPos+1);
                _y = y;
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            //tjek i y-n
            for(i=-1; i>-8; i--) {
                
                _y = y+i;
                if(_y<1) //Hold op med at tjekke ude for brættet:
                    break;

                _x = x
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }

            
            for(i=1; i<8; i++) {
                
                _y = y+i;
                if(_y>8) //Hold op med at tjekke ude for brættet:
                    break;

                _x = x
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
            
            
            
            //tjek i retning x-n; y-n (venstre):
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                _y = y+i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y<1) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
            
            for(i=-1; i>-8; i--) {
                xPos = alph.indexOf(x)+i;
                _y = y-i;
                if(xPos<0) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y>8) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }


            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                _y = y+i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y>8) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
            
            for(i=1; i<8; i++) {
                xPos = alph.indexOf(x)+i;
                _y = y-i;
                if(xPos>=8) //Hold op med at tjekke ude for brættet:
                    break;
                if(_y<1) 
                    break;

                _x = alph.substring(xPos, xPos+1);
                if($("#"+_x+""+_y).data("piece")==null) {
                    legalMoves.push(_x+_y);
                }
                if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                    legalMoves.push(_x+_y);
                    break;
                }
                if($("#"+_x+""+_y).data("owner")==owner) {
                    break;
                }
            }
        break;

        case "king":

            for(i=-1; i<=1; i++) { //x
                for(k=-1; k<=1; k++) { //y
                    if(i==0 && k==0)
                        continue;
                    xPos = alph.indexOf(x)+i;
                    _x = alph.substring(xPos, xPos+1);
                    _y = y+k;
    
                    if(xPos<0 || xPos>=8 || _y < 1 || _y > 8) //Hold op med at tjekke ude for brættet:
                        continue;
    
                    
                    if($("#"+_x+""+_y).data("piece")==null) {
                        legalMoves.push(_x+_y);
                    }
                    if($("#"+_x+""+_y).data("owner")!=owner && $("#"+_x+""+_y).data("piece")!=null) {
                        legalMoves.push(_x+_y);
                        continue;
                    }
                    if($("#"+_x+""+_y).data("owner")==owner) {
                        continue;
                    }



                }
            }


        break;


   }

   return legalMoves;
}