var fs = require('fs');
//var robot = require("robotjs");

var fuelrelease = false;

var argoscripts = {};

//TODO: Since we use lockfiles to communicate with AHK and AHK will also clear the lockfiles folder upon starting, all variables that
//can affect AHK's behavior must be in the lockifles directory themselves to avoid nodejs and ahk having different data

module.exports = {
  yoyoyo: function(){
    return console.log("yoyoyo called");
  },
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
  },
  ListHotkeys: function(){
    return [[["B","ALT","CTRL"],"yoyoyo"]];
  },
  OnChatMessageCaptured: function(line) {
    if (line.match(/^\[(\d+:)+\d+\] You have added [\d]+ unit\(s\) of fuel to your vehicle for \$[\d]+/) !== null ||
          line.match(/^\[(\d+:)+\d+\] This vehicle has a full tank of gas\./) !== null ){
  	//if ((line.includes("vehicle has a full tank of gas.") ||  line.includes("unit(s) of fuel to your vehicle for" ))) {// && fuelrelease == true
  		fuelrelease = false;
      argoscripts.SendMessageToSAMP("/engine");
      //argoscripts.SetLockFile('dostartenginecmd');
  	}
  	if (line.match(/^\[(\d+:)+\d+\] Do '\/fillup' to refuel your vehicle\./) !== null) {
      console.log("triggered");
  		fuelrelease = true;
      //argoscripts.SetLockFile('dofillupcmd');
      argoscripts.SendMessageToSAMP("/filljerrycan");
      argoscripts.SendMessageToSAMP("/fillup");
  	}
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
  	if(fuelrelease == true){
      /*try
      {
    		if(fs.readFileSync(require('path').resolve(__dirname, '../lockfiles/fuelrelease.lock'), 'utf8').length > 0){
          UnsetLockFile('fuelrelease');
    			//fs.unlinkSync(require('path').resolve(__dirname, '../lockfiles/fuelrelease.lock'));
    			fuelrelease = false;
          SetLockFile('dofillupreleasecmd');
          //fs.closeSync(fs.openSync(require('path').resolve(__dirname, '../lockfiles/dofillupreleasecmd.lock'), 'w'));
    			/*robot.typeString("t/fillup");
    			robot.keyTap("enter");
    			robot.typeString("t/engine");
    			robot.keyTap("enter");*
    		}
      }
      catch(err)
      {
        console.log("Error: Tried checking file while it was being written");
      }*/
  	}
  }
};

