//Future note: I deleted the elctron download folder from electron's directory in nodemodules since it didn't fit into git
//No known bugs caused, might have to be redeleted on updating

var fs = require('fs');
var math = require('mathjs');
var path = require('path'),
    walk = require('walk');

var windows_homedir = require('os').homedir();
var hotkeys = [];
var hotkeys_jsonstring = ""; //Used for efficiently checking if a hotkey is registered

var spammy = {};
spammy.log = function () {
  //logFile.write(util.format.apply(null, arguments) + '\r\n');
}

var currentversion = "0.2";

var currentlyexecuting = false;
var playername = null;
var player_coords = false;

var argoscripts = {
	GetCurrentVersion: function(){
		return currentversion;
	},
	test: function(){
		console.log("yo");
	},
	SetLockFile: function(name, data){
		spammy.log("Setlockfile: " + name);
		try{
			fs.writeFile(require('path').resolve(__dirname, 'lockfiles/'+name+'.lock'), data, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			}); 
			//fs.closeSync(fs.openSync(require('path').resolve(__dirname, 'lockfiles/'+name+'.lock'), 'w'));
		}catch(e){
			setTimeout(SetLockfile, 100, name);
			console.log("Failed to set lockfile: " + name);
		}
	},
	UnsetLockfile: function(name){
		spammy.log("Unsetlockfile: " + name);
		try{
			fs.unlinkSync(require('path').resolve(__dirname, 'lockfiles/'+name+'.lock'));
		}catch(e){
			console.log("Failed to delete lockfile: " + name);
			//setTimeout(UnsetLockfile, 100, name);
		}
	},
	SendMessageToSAMP: function(command){
		/*argoscripts.SetLockFile("sendmsg", "");
		process.nextTick(function(){
		    console.log("This will be printed later");
		});*/
		console.log(command);
		try{
			fs.appendFileSync('lockfiles/sendmsg.lock', command+'\n');
			fs.appendFileSync('lockfiles/sendmsg.log', command+'\n');
		}catch(e){
			console.log("Failed to append to message lockfile: " + command);
		}
	},
	SendMessageLocal: function(command){
		console.log(command);
		try{
			fs.appendFileSync('lockfiles/sendmsgl.lock', command+'\n');
			fs.appendFileSync('lockfiles/sendmsgl.log', command+'\n');
		}catch(e){
			console.log("Failed to append to messageL lockfile: " + command);
		}
	},
	getCoordinates: function(){
		return player_coords;
	}
};

function main(modules){
	spammy.log("main");
	ClearLockFiles(modules);
	CompileAHKFile();
	console.log("MAIN CALLED");
	console.log("Loaded " + modules.length + " plugins");
	console.log(windows_homedir+"\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt");
	var data =  fs.readFileSync(windows_homedir+"\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt", 'utf8');
	SendNewChatlogStartedCallbacks(data, modules);
	//var data =  fs.readFileSync("D:\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt", 'utf8');
	var chatlog_pointer = GetLineCount(data);

	var last_data = data;

	setInterval(function() {
		if(currentlyexecuting == true) return 1;
		currentlyexecuting = true;
		last_data = data;
		data =  fs.readFileSync(windows_homedir+"\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt", 'utf8');
		//data =  fs.readFileSync("D:\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt", 'utf8');
		if(data.length < last_data.length){
			chatlog_pointer = 0; //New game started
			console.log("New game started");
			SendNewChatlogStartedCallbacks(data, modules);
			ClearLockFiles();
		}
		if (data.length > last_data.length) {
			var lines = data.split(/\r?\n/);
			while(chatlog_pointer <= lines.length - 2){
				var line = lines[chatlog_pointer++];
				if(playername == null) CheckForPlayerName(data);
				SendChatMessageCallbacks(modules, String(line));
			}
		}

		SendTicks(modules);
		CheckAnyHotkeysPressed(modules);
		CheckAnyCommandsExecuted(modules);
		LoadLatestCoordinates();
		currentlyexecuting = false;
	}, 25);
}

function SendNewChatlogStartedCallbacks(data, modules){
	spammy.log("SendNewChatlogStartedCallbacks");
	for(var i = 0; i < modules.length; i++){
		modules[i].OnNewChatlogStarted(data, windows_homedir+"\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt");
	}
}

function LoadLatestCoordinates() {
	spammy.log("LatesCoordLoad");
	if(LockfileExistsAndAccessible("lastcoords")){
		result = ReadLockFile("lastcoords");
		if(result) {
			result = result.split(",");
			player_coords = [parseFloat(result[0]),parseFloat(result[1]),parseFloat(result[2])];
		}
	}
}

function CheckForPlayerName(data) {
	//console.log(line.match());
	var lines = data.split(/\r?\n/);
	//This is excessive 
	for (var i = 0; i < lines.length; i++)
	{
		//console.log(lines[i]);
		if(lines[i].match(/^\[\d\d:\d\d:\d\d\] You have successfully logged in,/) !== null ||
		   lines[i].match(/^\[\d\d:\d\d:\d\d\] Welcome back, /) !== null) { //Welcome back msg is shown to admins
			var split = lines[i].split(" ");
			var name = split[split.length-1];
			playername = name.slice(0, -2);
		}

	}
	if(data.match(/\[\d\d:\d\d:\d\d\] You have successfully logged in, (.+)\./) !== null){
		//console.log(data.match(/\[\d\d:\d\d:\d\d\] You have successfully logged in, (.+)\./)[1]);
		//playername = data.match(/\[\d\d:\d\d:\d\d\] You have successfully logged in, (.+)\./)[1];
	}
}

function yo(){
	console.log("yo");
}

function CheckAnyCommandsExecuted(modules)
{
	var result;
	spammy.log("CheckAnyCommandsExecuted");
	if(LockfileExistsAndAccessible("lastcmd")){
		result = ReadLockFile("lastcmd");
		result = result.split("\n");
		argoscripts.UnsetLockfile("lastcmd");
		for(var j = 0; j < result.length; j++)
		{
			if (result[j] != "")
			{
				for(var i = 0; i < modules.length; i++){
					modules[i].OnCommandRecieved(result[j]);
				}
			}
		}
	}
}

function CheckAnyHotkeysPressed(modules){
	spammy.log("HotkeyExecutedCheck");
	for(var i = 0; i < hotkeys.length; i++){
		if(LockfileExistsAndAccessible("hotkey_"+hotkeys[i][0].join(""))){
			//console.log(hotkeys);
			argoscripts.UnsetLockfile("hotkey_"+hotkeys[i][0].join(""));
			hotkeys[i][1][hotkeys[i][2]](hotkeys[i][0].join("")); //2nd parameter is the module that registered hotkey, 3rd parameter is the name of function inside that module
		}
	}
}

function LockfileExistsAndAccessible(filename){
	//console.log(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'));
	spammy.log("Existcheck: " + filename);
	try {
	    fs.accessSync(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'), fs.F_OK);
	    return true;
	    // Do something
	} catch (e) {
		return false;
	    // It isn't accessible
	}
}

function ReadLockFile(filename){
	//console.log(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'));
	spammy.log("Read: " + filename);
	try {
	    var data =  fs.readFileSync(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'), 'utf8');
	    return data;
	} catch (e) {
		return false;
	}
}

function KillProcess(process){
	spammy.log("KillProcess");
	process.kill('SIGINT');
}

function CompileAHKFile(){
	//RegisterHotkey(["CTRL", "ALT", "A"]);
	spammy.log("CompileAHKFile");
	fs.writeFileSync('argo.ahk', fs.readFileSync('base.ahk'));
	for(var i = 0; i < hotkeys.length; i++){
		var ahkstring = "";
		var releasestring = "";
		for(var j = 0; j < hotkeys[i][0].length; j++){
			switch(hotkeys[i][0][j]) {
				case "CTRL":
					releasestring += "\n\tKeyWait, Ctrl"
					ahkstring = "^" + ahkstring;
					//ahkstring += "^";
					break;
				case "WIN":
					//releasestring += "{ Up}"; //Currently nothing since there are two windows keys and no global Win key according to ahk's docs and we dont wanna accidentally trigger a hotkey on the wrong one
					ahkstring = "#" + ahkstring;
					//ahkstring += "#";
					break;
				case "ALT":
					releasestring += "\n\tKeyWait, Alt";
					ahkstring = "!" + ahkstring;
					//ahkstring += "!";
					break;
				case "SHIFT":
					releasestring += "\n\tKeyWait, Shift";
					ahkstring = "+" + ahkstring;
					//ahkstring += "+";
					break;
				default:
					ahkstring += hotkeys[i][0][j].toLowerCase();	
					break;			
			}
		}
		console.log(hotkeys[i][0]);
		var appendString = "\n"+ahkstring+" Up::\n\tlastfilereaddir := \""+hotkeys[i][0].join("")+"\"\nreturn";
		if(hotkeys[i][0][0].localeCompare("W") == 0 || hotkeys[i][0][0].localeCompare("S") == 0)
		{
			console.log("triggered");
			//We don't want to block W or S only hotkeys to avoid blocking movement
			appendString = appendString.replace("\n"+ahkstring+" Up::", "\n~"+ahkstring+"::");
		}
		//var appendString = "\n"+ahkstring+"::\n\tFileAppend, This is a blank line`n, %A_WorkingDir%\\lockfiles\\hotkey_"+hotkeys[i][0].join("")+".lock"+releasestring+"\nreturn";
		fs.appendFileSync('argo.ahk', appendString);
	}
	setTimeout(ReloadAHKFile, 2000);
	//require("child_process").exec('argo.ahk').unref();
}

function ReloadAHKFile(){
	argoscripts.SetLockFile("reloadahk");
	/*const exec = require('child_process').exec;
	var cmd = exec('argo.ahk');
	setInterval(KillProcess, 300, cmd);*/
	/*var cp = require("child_process");
	cp.exec("argo.ahk"); // notice this without a callback..
	cp.exit(0); // exit this nodejs process*//*
	//require("child_process").exec('argo.ahk').unref();*/
}


function RegisterHotkey(hotkeyarray, module, fname){
	//console.log(hotkeyarray);
	spammy.log("RegisterHotkey");
	hotkeyarray.sort(); //Necessary to ensure that even if parameters are passed in different order they're still detected
	var hotkeyarray_jsonstring = JSON.stringify(hotkeyarray);
	if(hotkeys_jsonstring.indexOf(hotkeyarray_jsonstring) != -1){
		console.trace("ERROR: " + "Hotkey is already registered: " + hotkeyarray_jsonstring);
		throw "Hotkey is already registered: " + hotkeyarray_jsonstring;
	}

	hotkeys.push([hotkeyarray, module, fname]);
	hotkeys_jsonstring = JSON.stringify(hotkeys);
}

function GetLineCount(text){
	spammy.log("GetLineCount");
	var lines = text.split(/\r?\n/);
	if(lines.length < 0) return 0;
	else return lines.length-2;
}

function ClearLockFiles(modules){
	spammy.log("ClearLockFiles");
	var walker  = walk.walk('lockfiles', { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    var current = path.join(root, stat.name);
	    try
	    {
			fs.unlinkSync(require('path').resolve(__dirname, current));
	    } catch(e) {
	    	console.log("Could not delete file: " + require('path').resolve(__dirname, current));
	    }
	    next();
	});
}

function SendChatMessageCallbacks(modules, line){
	//console.log(playername);
	if(playername == null) return 1; //No messages are sent till the player name is set
	spammy.log("SendChatMessageCallbacks");
	for(var i = 0; i < modules.length; i++){
		modules[i].OnChatMessageCaptured(line, playername);
	}
}

function SendTicks(modules){
	spammy.log("SendTicks");
	for(var i = 0; i < modules.length; i++){
		modules[i].OnTick();
	}
}

function findModules(folder,done){
	spammy.log("findModules");
    var walker  = walk.walk(folder, { followLinks: false }),
        modules = [];

    walker.on('file', function(root, stat, next) {
        var current = path.join(root, stat.name),
            extname = path.extname(current);

        current = "./"+current;
        if(extname === '.js'){
            var module = require(current);
            module.OnModuleInit(argoscripts);
            var hotkeys = module.ListHotkeys()
            for(var i = 0; i < hotkeys.length; i++){
            	RegisterHotkey(hotkeys[i][0], module, hotkeys[i][1]);
            }
            modules.push(module);
        }

        next();
    });

    walker.on('end', function() {
        done(modules);
    });
}

/*findModules({
    folder: 'plugins',
    filter: undefined // either undefined or a filter function for module names
}, function(modules){
	//main(modules);
});*/

var counter = 0; //Number of different findModules calls. If more plugins are loaded from other folders, increate the counter condition below
var modules_array = [];
function concatAndExecute(modules){
	modules_array = modules_array.concat(modules);
	//console.log(modules_array.length);
	if(counter == 1){
		main(modules_array);
	}
	counter++;
}

findModules('plugins', concatAndExecute);

findModules('plugins_system', concatAndExecute);

exports.checkHotkeyExists = function(hotkeyarray){
	hotkeyarray = hotkeyarray.filter(function(e) { return e !== 'N/A' })
	//console.log(hotkeyarray);
	hotkeyarray.sort(); //Necessary to ensure that even if parameters are passed in different order they're still detected
	var hotkeyarray_jsonstring = JSON.stringify(hotkeyarray);
	if(hotkeys_jsonstring.indexOf(hotkeyarray_jsonstring) != -1) return true;
	return false;
};