var fs = require('fs');

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
  		fuelrelease = false;
      argoscripts.SendMessageToSAMP("/engine");
  	}
  	if (line.match(/^\[(\d+:)+\d+\] Do '\/fillup' to refuel your vehicle\./) !== null) {
      console.log("triggered");
  		fuelrelease = true;
      argoscripts.SendMessageToSAMP("/filljerrycan");
      argoscripts.SendMessageToSAMP("/fillup");
  	}
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){

  },
  OnCommandRecieved: function(cmd){
    
  }
};

