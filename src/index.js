var fs = require('fs');
var math = require('mathjs');
var path = require('path'),
    walk = require('walk');

var chatlogfile = FindChatlogFile();

console.log("FILE FOUND AT " + chatlogfile)

function FileExistsAndAccessible(file)
{
	try {
	    fs.accessSync(file, fs.F_OK);
	    return true;
	} catch (e) {
		return false;
	}
}

function FindChatlogFile()
{
	var windows_homedir = require('os').homedir();

	var known_locations = [
		windows_homedir+"\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt",
		windows_homedir+"\\OneDrive\\Documents\\GTA San Andreas User Files\\SAMP\\chatlog.txt"
	];

	for (var i = 0; i < known_locations.length; i++)
	{
		if (FileExistsAndAccessible(known_locations[i]))	return known_locations[i];
	}

	throw "ERROR: CHATLOG FILE NOT FOUND";
}

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

var isdriver = false;

var chatisopen = false;

var argoscripts = {
	GetCurrentVersion: function(){
		return currentversion;
	},
	SetLockFile: function(name, data){
		spammy.log("Setlockfile: " + name);
		try{
			fs.writeFile(require('path').resolve(__dirname, 'lockfiles/'+name+'.lock'), data, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			});
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
		}
	},
	SendMessageToSAMP: function(command){
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
	},
	isPlayerDriver: function(){
		return isdriver;
	},
	isChatOpen: function(){
		return chatisopen;
	}
};

function main(modules){
	spammy.log("main");
	ClearLockFiles(modules);
	CompileAHKFile();
	console.log("MAIN CALLED");
	console.log("Loaded " + modules.length + " plugins");
	console.log(chatlogfile);
	var data =  fs.readFileSync(chatlogfile, 'utf8');
	SendNewChatlogStartedCallbacks(data, modules);
	var chatlog_pointer = GetLineCount(data);

	var last_data = data;

	setInterval(function() {
		if(currentlyexecuting == true) return 1;
		currentlyexecuting = true;
		last_data = data;
		data =  fs.readFileSync(chatlogfile, 'utf8');
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
		CheckIfDrivingAnyVehicle();
		CheckIfChatIsOpen();
		currentlyexecuting = false;
	}, 25);
}

function SendNewChatlogStartedCallbacks(data, modules){
	spammy.log("SendNewChatlogStartedCallbacks");
	for(var i = 0; i < modules.length; i++){
		modules[i].OnNewChatlogStarted(data, chatlogfile);
	}
}

function CheckIfChatIsOpen()
{
	spammy.log("CheckIfInChat");

	if(LockfileExistsAndAccessible("chatisopen")){
		chatisopen = true;
	}

	if(LockfileExistsAndAccessible("chatisnotopen")){
		chatisopen = false;
	}
}

function CheckIfDrivingAnyVehicle()
{
	spammy.log("CheckIfDriving");

	if(LockfileExistsAndAccessible("isdriver")){
		isdriver = true;
	}

	if(LockfileExistsAndAccessible("isnotdriver")){
		isdriver = false;
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
	var lines = data.split(/\r?\n/);
	//This is excessive 
	for (var i = 0; i < lines.length; i++)
	{
		if(lines[i].match(/^\[\d\d:\d\d:\d\d\] You have successfully logged in,/) !== null ||
		   lines[i].match(/^\[\d\d:\d\d:\d\d\] Welcome back, /) !== null) { //Welcome back msg is shown to admins
			var split = lines[i].split(" ");
			var name = split[split.length-1];
			playername = name.slice(0, -2);
		}

	}
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
			argoscripts.UnsetLockfile("hotkey_"+hotkeys[i][0].join(""));
			hotkeys[i][1][hotkeys[i][2]](hotkeys[i][0].join("")); //2nd parameter is the module that registered hotkey, 3rd parameter is the name of function inside that module
		}
	}
}

function LockfileExistsAndAccessible(filename){
	spammy.log("Existcheck: " + filename);
	try {
	    fs.accessSync(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'), fs.F_OK);
	    return true;
	} catch (e) {
		return false;
	}
}

function ReadLockFile(filename){
	spammy.log("Read: " + filename);
	try {
	    var data =  fs.readFileSync(require('path').resolve(__dirname, 'lockfiles/'+filename+'.lock'), 'utf8');
	    return data;
	} catch (e) {
		return false;
	}
}

function CompileAHKFile(){
	spammy.log("CompileAHKFile");
	fs.writeFileSync('argo.ahk', fs.readFileSync('base.ahk'));
	for(var i = 0; i < hotkeys.length; i++){
		var ahkstring = "";
		for(var j = 0; j < hotkeys[i][0].length; j++){
			switch(hotkeys[i][0][j]) {
				case "CTRL":
					ahkstring = "^" + ahkstring;
					break;
				case "WIN":
					ahkstring = "#" + ahkstring;
					break;
				case "ALT":
					ahkstring = "!" + ahkstring;
					break;
				case "SHIFT":
					ahkstring = "+" + ahkstring;
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
		fs.appendFileSync('argo.ahk', appendString);
	}
	setTimeout(ReloadAHKFile, 2000);
}

function ReloadAHKFile(){
	argoscripts.SetLockFile("reloadahk");
}


function RegisterHotkey(hotkeyarray, module, fname){
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

var counter = 0; //Number of different findModules calls. If more plugins are loaded from other folders, increate the counter condition below
var modules_array = [];
function concatAndExecute(modules){
	modules_array = modules_array.concat(modules);
	if(counter == 1){
		main(modules_array);
	}
	counter++;
}

findModules('plugins', concatAndExecute);

findModules('plugins_system', concatAndExecute);

exports.checkHotkeyExists = function(hotkeyarray){
	hotkeyarray = hotkeyarray.filter(function(e) { return e !== 'N/A' })
	hotkeyarray.sort(); //Necessary to ensure that even if parameters are passed in different order they're still detected
	var hotkeyarray_jsonstring = JSON.stringify(hotkeyarray);
	if(hotkeys_jsonstring.indexOf(hotkeyarray_jsonstring) != -1) return true;
	return false;
};