/*//var robot = require("robotjs");
var argoscripts = {};

var engine_state = 1; //1: on, 0: off

module.exports = {
  OnModuleInit: function(fargoscripts){
  	argoscripts = fargoscripts;
  },
  init_engine: function(){
    if (engine_state == 0)
    {
    	argoscripts.SendMessageToSAMP('/engine');
    }
  },
  ListHotkeys: function(){
    return [[["W"],"init_engine"], [["S"],"init_engine"]];
  },
  OnChatMessageCaptured: function(line, playername) {
    
  },
  OnTick: function(){
  	
  }
};*/

var argoscripts = {};

var engine_state = 1; //1: on, 0: off

var last_init_engine_detected = 0;

module.exports = {
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
  },
  ListHotkeys: function(){
    return [[["W"],"init_engine"], [["S"],"init_engine"]];
  },
  init_engine: function(){
    if (!argoscripts.isPlayerDriver())
    {
      engine_state = 1;
    }

    if (engine_state == 0)
    {
      if (last_init_engine_detected + 2000 < Date.now())
      {
        argoscripts.SendMessageToSAMP('/engine');
        last_init_engine_detected = Date.now();
      }
    }
  },
  OnChatMessageCaptured: function(line, playername) {
    if (line.match(/^\[(\d+:)+\d+\] Where you going pal\?! The repair wasn't done yet!/) !== null) {
      argoscripts.SendMessageToSAMP("/engine");
    }

    if (line.match(/^\[(\d+:)+\d+\] Your vehicle has been repaired/) !== null) {
      argoscripts.SendMessageToSAMP("/engine");
    }

    console.log(line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) turns the engine of their ([\w\W]*) on/));

    if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) turns the engine of their ([\w\W]*)/) !== null)
    {
      if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) turns the engine of their ([\w\W]*)/)[2] == playername)
      {
        if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) turns the engine of their ([\w\W]*) on/) !== null) {
          engine_state = 1;
        }

        if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) turns the engine of their ([\w\W]*) off/) !== null) {
          engine_state = 0;
        }
      }
    }
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
    
  },
  OnCommandRecieved: function(cmd){
    
  }
};