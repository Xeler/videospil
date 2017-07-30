/*!
 * The following copyright notice may not be removed under any circumstances.
 * 
 * Copyright:
 * © 2011, Giant Ham Entertainment ©
 * 2011 Oliver Pedersen. All rights reserved.
 * 
 * 
 * Full name:
 * LineCraftJSEngine
 * 
 * Coder:
 * Oliver Pedersen
 * 
 * Idea:
 * Oskar
 *
 *
 * Vendor URL:
 * http://www.giantham.com/linecraft
 * 
 * License information:
 * http://www.giantham.com/linecraft/license
 */


/*	Declare all variables	*/
var rows;
var col;

var terString; //This string will have the map that will be sent to the div 'terrain' (in 1 line, containing <br /> tags) 


/*	These vars will have the value of the max and min coords generated.	*/
var ymin;
var ymax;
var xmin;
var xman;


/*	Current coords for the TOP LEFT piece of terrain (upper-left corner)	*/
var cury;
var curx;

/*	Current direction the player is facing	*/
var facing;


var noclip = false; //If true, the player can run through trees... somehow..



/*	2D array containing the map	*/
/*	NOTE: The coords are defined*/
/*	as [y;x] - not [x;y]		*/
var map = new Array();



/*	Inventory	*/
var lumber = 0;






/*	These declares the amount of rows / columns visible	*/
var rows = 30; //Defines the rows		- this value should ONLY be an even integer
var cols = 100;  //Defines the columns	- this value should ONLY be an even integer


var facing; /*	This var contains which direction the player is facting (w / a / s / d)	*/

/*	end declariation */

function startNew() {
	mapPlayer();	//Fixes the upper layer, locating the player in the middle
	createNewMap();
	init();
}

function init() {
	
	document.getElementById('stuff').style.visibility = 'visible';
	
	
	/*	code to track user input */
	
	document.onkeydown = function(e) {
		var which = (window.event) ? event.keyCode : e.keyCode;
		switch(which) {
			case 87: //W
				action('W');
			break;
			
			case 65: //A
				action('A');
			break;
			
			case 83: //S
				action('S');
			break;
			
			case 68: //D
				action('D');
			break;
			
			case 32: //' '
				action('space');
			break;
			
			case 84: //'T'
				action('T');
			break;
			
		}
	}
}

function action(k) { /* param 'k' = key pressed (in text) */
	switch(k) {
		case 'W':
			/*	First set the player to be facing the right direction...	*/
			facing='W'
			/*	Then check if there's a tree above the player	*/
			if(!isTreeAt('W') || noclip) {
				/*	no? good, then generate new terrain if needed, and move the player!	*/
				genMissing('top');	/*	Generates new terrain if needed	*/
				cury = cury-1;	/*	Set the location  to 1 tile above us.	*/
				if(cury<=ymin) ymin=cury;
				printMap(cury, curx);	/*	Print the terrain out, from the new location.	*/
			}
		break;
		
		case 'A':
		facing='A'
			if(!isTreeAt('A') || noclip) {
				genMissing('left');
				curx = curx-1;
				if(curx<=xmin) xmin=curx;
				printMap(cury, curx);
			}
			
		break;
		
		
		case 'S':
		facing='S'
			if(!isTreeAt('S') || noclip) {
				genMissing('bot'); /*	Uses cury+rows because it's the location of x tiles downward, x being the amount of rows.	*/
				cury = cury+1
				if(cury+rows-1>=ymax) {
					ymax=(cury+rows-1);
				}
				printMap(cury, curx);
			}
		break;
		
		case 'D':
		facing='D'
			if(!isTreeAt('D') || noclip) {
				genMissing('right');
				curx = curx+1;
				if(curx+cols-1>=xmax) (xmax=curx+cols-1);
				
				printMap(cury, curx);
				
			}
		break;
		
		case 'space': /*	Pick up an item.	*/
				
				
				
		break;
		
		case 'T':
			switch(facing) {
			
				case 'W':
					if(isTreeAt('W')) {
						map[(rows/2)-1+cury][(cols/2)+curx] = '_';
						printMap(cury, curx);
						lumber++;
						updateLumber();
					}
				break;
				
				case 'A':
					if(isTreeAt('A')) {
						map[rows/2+cury][(cols/2)-1+curx] = '_';
						printMap(cury, curx);
						lumber++;
						updateLumber();
					}
				break;
				
				case 'S':
					if(isTreeAt('S')) {
						map[(rows/2)+1+cury][cols/2+curx] = '_';
						printMap(cury, curx);
						lumber++;
						updateLumber();
					}
				break;
				
				case 'D':
					if(isTreeAt('D')) {
						map[rows/2+cury][(cols/2)+1+curx] = '_';
						printMap(cury, curx);
						lumber++;
						updateLumber();
					}
				break;
				
				
				
			
			}
			
			
		break;
		
	}
	
	document.getElementById('xcoords').value = curx;
	document.getElementById('ycoords').value = cury;
	
	
	
}


function moveBg(direction, factor) {
	
	
	
	
}

function isTreeAt(location) { /*	This function checks if there's a tree at the given location (W / A / S / D)	*/
	switch(location) {
		
		case 'W':
			if(map[(rows/2)-1+cury][(cols/2)+curx]=='I') return true;
			else return false;
		break;
		
		case 'A':
			if(map[rows/2+cury][(cols/2)-1+curx]=='I') return true;
			else return false;
		break;
		
		case 'S':
			if(map[(rows/2)+1+cury][cols/2+curx]=='I') return true;
			else return false;
		break;
		
		case 'D':
			if(map[rows/2+cury][(cols/2)+1+curx]=='I') return true;
			else return false;
		break;
		
	}
}




function genMissing(loc) {	/*	Generates new terrain - on the fly! ;O	*/
	switch(loc) {
		
		case "top":
			for(x=curx; x<curx+cols; x++) {
				if(!map[cury-1]) map[cury-1] = new Array();	/*	If the array is undefined, make it a 2D-array	*/
				if(!map[cury-1][x]) map[cury-1][x] = randomTexture(); /*	If the x-value is undefined, make it a random texture.	*/
			}
		break;
		
		
		case "bot":
			for(x=curx; x<curx+cols; x++) {
				if(!map[cury+rows]) map[cury+rows] = new Array();
				if(!map[cury+rows][x]) map[cury+rows][x] = randomTexture();
				
				
			}
		break;
		
		case "left":
			for(y=cury; y<cury+rows; y++) {
				if(!map[y]) map[y] = new Array();
				if(!map[y][curx-1]) map[y][curx-1] = randomTexture();
			}
		break;
		
		
		case "right":
			for(y=cury; y<cury+rows; y++) {

				if(!map[y]) map[y] = new Array();
				if(!map[y][curx+cols]) map[y][curx+cols] = randomTexture();
			}
			
		break;
		
		
	}
	
	
}

function updateLumber() {
	
	document.getElementById('lumberamount').innerHTML = lumber;
	
}












function printMap(q, w) { /*	Parameters 'q' and 'm' are the offset (where it should start printing from)	*/
	terString = '';	/*	Clears the map; ready for update!	*/
	for(y=0; y<rows; y++) {
		for(x=0; x<cols; x++) {
		/*	if(x==(cols/2)&&y==(rows/2)) {
				terString = terString + ' ';
			} else {
		*/		terString = terString + map[parseInt(y+q)][parseInt(x+w)];	/*	Here the offsets are added to the coords.	*/
				
		//	}
		}
		terString = terString + "<br />";
	}
	document.getElementById('board').innerHTML = terString;
}





/*	This function is only used once upon init.	*/
function mapPlayer() {
	var tempstring = '';
	for(y=0; y<rows; y++) {
		for(x=0; x<cols; x++) {
			if(x==(cols/2)&&y==(rows/2)) {
				var tempstring = tempstring + '<img src="imgs/player.png" />';
			} else {
				var tempstring = tempstring + ' ';
			}
		}
		var tempstring = tempstring + '<br />';
	}
	document.getElementById('player').innerHTML = tempstring;
}



function requestSaveFile() {
	var gid = document.getElementById('gameId').value;
	
	
	var xmlhttp;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			eval(xmlhttp.responseText);
			mapPlayer();
			printMap(cury, curx);
			init();
		}
	}
	

	
	
	xmlhttp.open("POST","load.php", true);
	params = "id="+gid;
	
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.setRequestHeader("Content-length", params.length);
	xmlhttp.setRequestHeader("Connection", "close");
	
	
	
	xmlhttp.send(params);
	
	
	
	
}



function createNewMap() {
	contString = '';
	for(y=0; y<rows; y++) {
		map[''+y+''] = new Array;
		for(x=0; x<cols; x++) {
			if(x==(cols/2)&&y==(rows/2)) {
				map[''+y+''][''+x+''] = ' '; /*	ensures that the player does not spawn on a tree	*/
			} else {
				var texture = randomTexture()
				map[''+y+''][''+x+''] = texture;
			}
		}
	}
	ymin = 0;
	ymax = rows-1; /*	-1 because it doesn't actually make the last tile - (y<rows; not y<=rows)	*/
	xmin = 0;
	xmax = cols-1;
	cury = 0;
	curx = 0;
	
	printMap(0, 0);
}

function randomTexture() {
	var texture = ' '
	var perc = randomNumber(1, 1000)
	
	
	if(perc>=998) texture='~';
	else if(perc>=900) texture='I';
	
	return texture;
	
	
}

function buildHouse(direction) {
	
	
	

}



/*	Returns a random number between min and max	*/
function randomNumber(min, max) {
	var max = max-min+1;
	return (Math.floor(Math.random()*max+min));
	
}





function saveGame() {
	
	var xmlhttp;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			alert("Game saved! Save ID: " + xmlhttp.responseText);
		}
	}
	
	//xmlhttp.open("GET","save.php?arr="+getSaveStr()+"&loc="+cury+","+curx,true);
	
	
	
	xmlhttp.open("POST","save.php", true);
	params = "arr="+getSaveStr()+"&loc="+cury+","+curx;
	params = params + "&min="+ymin+','+xmin;
	params = params + "&max="+ymax+','+xmax;
	
	
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.setRequestHeader("Content-length", params.length);
	xmlhttp.setRequestHeader("Connection", "close");
	
	
	
	xmlhttp.send(params);
	
}


function getSaveStr() {
	
	var newStr = new String("");
	for(y=ymin; y<map.length; y++) {
		for(x=xmin; x<map[y].length; x++) {
			if(map[y][x]!="undefined") {
				var newStr = newStr.concat(y + ',' + x + ',' + map[y][x] + ",");
			}
		}
	}
	return newStr;
	
}