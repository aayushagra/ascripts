var fs = require('fs');

var {ipcRenderer, remote} = require('electron');  
var main = remote.require("./main.js");

var obj = [];
var valuesetter = []; //Used to set the value of each select after loading is done
var addremovelisterneradd = [];
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

function generateTextboxes(blockid, hkarray){
	var istring = "";
	istring += "<div class=\"col-xs-8\">";
	for (var i = 0; i < hkarray.length; i++){
		if(!hkarray[i]) hkarray[i] = "Enter hotkey here (Eg. /engine)";
		istring += "<div class=\"input-group\">";
		istring += "<input type=\"text\" class=\"form-control\" value=\""+hkarray[i]+"\" aria-describedby=\"basic-addon2\" id=hotkey_"+String(blockid)+"_"+i+">";
		istring += "<span class=\"input-group-btn\">";
		var addid = "add_"+String(blockid)+"_"+i;
		var removeid = "remove_"+String(blockid)+"_"+i;
		addremovelisterneradd.push([addid, removeid]);
		istring += "<button id="+addid+" class=\"btn btn-danger\" type=\"button\">+</button>";
		istring += "<button id="+removeid+" class=\"btn btn-danger\" type=\"button\">-</button>";
		istring += "</span></div><hr class=\"vertical-spacer\">";
	}
	istring += "</div>";
	return istring;
}

function generateHotkeyBlock(obj, blockid){
	istring = "";
	istring += "<div class=\"row\">";
	for(var i = 0; i < 4; i++){
		istring += generateSelectBlock(i, blockid, obj["Combination"][i]);
	}
	istring += generateTextboxes(blockid, obj["Output"]);
	istring += "</div>";
	return istring;
}

function loadHotkeys(){
	ourhotkeys = [];
	valuesetter = [];
	addremovelisterneradd = [];
	var inputstring = "";
	obj = JSON.parse(fs.readFileSync('../hotkeys.json', 'utf8'));

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
	console.log(addremovelisterneradd);
	for(var i = 0; i < addremovelisterneradd.length; i++){
		//Attach listeners for add and remove
		document.getElementById (addremovelisterneradd[i][0]).addEventListener ("click", OnAddClicked, false);
		document.getElementById (addremovelisterneradd[i][1]).addEventListener ("click", OnRemoveClicked, false);
	}
	console.log(valuesetter);
}

function OnAddClicked(event){
	saveRows("true");
	var targetElement = event.target || event.srcElement;
	var data = targetElement.id.split("_");
	obj[data[1]]["Output"].splice(parseInt(data[2])+1,0,"");
	saveObjToFile(obj);
}

function OnRemoveClicked(event){
	saveRows("true");
	var targetElement = event.target || event.srcElement;
	var data = targetElement.id.split("_");
	obj[data[1]]["Output"].splice(data[2],1);
	if(obj[data[1]]["Output"].length == 0) obj.splice(data[1],1);
	saveObjToFile(obj);
}

function saveObjToFile(newobj){
	fs.writeFileSync("../hotkeys.json", JSON.stringify(newobj, null, 2));
	console.log(obj);
	loadHotkeys();
}

function newRow(event){
	saveRows("true");
	var targetElement = event.target || event.srcElement;
	console.log(targetElement.id);
	obj.push({Combination: ["N/A","N/A","N/A","N/A"], Output: [""]});
	saveObjToFile(obj);
}

function saveRows(quiet){ //NOTE: When javascript calls this function it'll pass it the event class instead, which is why we test with string
	var newobj = [];
	var success = true;
	for(var i = 0; i < numBlocksLoaded; i++){
		var temp = [];
		var temptextarray = [];
		for(var j = 0; j < 4; j++){
			temp.push($("#"+String(i)+"_sel"+String(j)).val());
		}
		if(main.checkHotkeyExists(temp) && ourhotkeys.indexOf(temp.slice().sort().join("")) == -1){ //Slice with no arguments to produce a dupe array
			temp = temp.filter(function(e) { return e !== 'N/A' })
			alert("Hotkey already exists: "+temp.join(","));
			success = false;
			break;
		}
		for(var j = 0; j < obj[i]["Output"].length; j++){
			temptextarray.push($("#hotkey_"+String(i)+"_"+j).val());
		}
		newobj.push({Combination: temp, Output: temptextarray});
	}
	if(success){
		saveObjToFile(newobj);
		if (quiet != "true")	alert("Hotkeys saved successfully, please restart to load new hotkeys")
	}
}

document.getElementById ("newrow").addEventListener ("click", newRow, false);
document.getElementById ("saverows").addEventListener ("click", saveRows, false);

loadHotkeys();
console.log(obj);