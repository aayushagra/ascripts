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
  			argoscripts.SendMessageToSAMP("/l Result: "+ String(math.eval(line.split(':')[4].trim())));
		  }
		  catch(err)
		  {
			 console.log("Math error");
		  }
	}
  },
  OnTick: function(){
  	
  }
};