var fs = require('fs');

var {ipcRenderer, remote} = require('electron');  
var main = remote.require("./main.js");

var obj = [];
var valuesetter = []; //Used to set the value of each select after loading is done
var numBlocksLoaded = 0;
var ourhotkeys = [];
function generateSelectBlock(num, blockid, hotkey){
	var id = String(blockid)+"_sel"+String(num);
	istring = "<div class=\"col-xs-1 nopadding\">          <div class=\"form-group\">";
	istring += "<select class=\"form-control\" id=\""+id+"\">";
	istring += fs.readFileSync('allowedkeys.xml', 'utf8');
    istring += "</select>          </div>        </div>";

    valuesetter.push([id, hotkey]);
	return istring;
}

function generateTextbox(blockid, string){
	return "<div class=\"col-xs-8\"><input type=\"text\" class=\"form-control\" value=\""+string+"\" aria-describedby=\"basic-addon2\" id=hotkey_"+String(blockid)+"></div>";
}

function generateHotkeyBlock(obj, blockid){
	istring = "";
	istring += "<div class=\"row\">";
	for(var i = 0; i < 4; i++){
		istring += generateSelectBlock(i, blockid, obj["Combination"][i]);
	}
	if(!obj["Output"]) istring += generateTextbox(blockid, "Enter hotkey here (EG. /engine)");
	else istring += generateTextbox(blockid, obj["Output"]);
	istring += "</div>";
	return istring;
}

function loadHotkeys(){
	ourhotkeys = [];
	var inputstring = "";
	obj = JSON.parse(fs.readFileSync('jojo.json', 'utf8'));

	for(var i = 0; i < obj.length; i++){
		ourhotkeys.push(obj[i]["Combination"].slice().sort().join(""));
		inputstring += generateHotkeyBlock(obj[i], i);
	}
	numBlocksLoaded = obj.length;
	document.getElementById("cnt").innerHTML = inputstring;

	console.log(ourhotkeys);
	for(var i = 0; i < valuesetter.length; i++){
		$("#"+valuesetter[i][0]).val(valuesetter[i][1]);
	}
	console.log(valuesetter);
}

function saveObjToFile(newobj){
	fs.writeFileSync("jojo.json", JSON.stringify(newobj, null, 2));
	console.log(obj);
	loadHotkeys();
}

function newRow(){
	obj.push({Combination: ["N/A","N/A","N/A","N/A"], Output: ""});
	saveObjToFile(obj);
}

function saveRows(){
	var newobj = [];
	var success = true;
	for(var i = 0; i < numBlocksLoaded; i++){
		var temp = [];
		for(var j = 0; j < 4; j++){
			temp.push($("#"+String(i)+"_sel"+String(j)).val());
		}
		if(main.checkHotkeyExists(temp) && ourhotkeys.indexOf(temp.slice().sort().join("")) == -1){ //Slice with no arguments to produce a dupe array
			temp = temp.filter(function(e) { return e !== 'N/A' })
			alert("Hotkey already exists: "+temp.join(","));
			success = false;
			break;
		}
		newobj.push({Combination: temp, Output: $("#hotkey_"+String(i)).val()});
	}
	if(success){
		saveObjToFile(newobj);
		alert("Hotkeys saved successfully, please restart to load new hotkeys")
	}
}

document.getElementById ("newrow").addEventListener ("click", newRow, false);
document.getElementById ("saverows").addEventListener ("click", saveRows, false);
loadHotkeys();
console.log(obj);