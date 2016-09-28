//var robot = require("robotjs");
var math = require('mathjs');

var argoscripts = {};

module.exports = {
  OnModuleInit: function(fargoscripts){
  	argoscripts = fargoscripts;
  },
  sendyo: function(){

  	argoscripts.SendMessageToSAMP('/l yo');
  },
  ListHotkeys: function(){
    return [[["A","ALT","CTRL"],"sendyo"]];
  },
  OnChatMessageCaptured: function(line, playername) {
    //[19:41:07] Philip_Ancelotti(42) says: math: 4+4
    //console.log();
    if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) says[a-zA-Z\[\] ]*: [mM]ath:/) !== null) {
      if (line.match(/^\[(\d+:)+\d+\] ([\w\W]*)\(\d+\) says[a-zA-Z\[\] ]*: [mM]ath:/)[2] != playername) return 1;
      //console.log(playername);
  		try
  		{
  			argoscripts.SendMessageLocal("Math.js: "+ String(math.eval(line.split(':')[4].trim())));
		  }
		  catch(err)
		  {
			 argoscripts.SendMessageLocal("ERROR: Invalid syntax");
       argoscripts.SendMessageLocal("Usage examples: /math 4+4, /math 9*9, /math 40/4, /math 90*(4+5) e.t.c");
		  }
	  }
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
  	
  },
  OnCommandRecieved: function(cmd){
    console.log("Recieved: " + cmd);
    cmd = cmd.split(" ");
    if(cmd[0] == "/emath")
    {
      argoscripts.SendMessageLocal("FUCK OFF");
    }
  }
};