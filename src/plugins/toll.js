var fs = require('fs');


var argoscripts = {};

module.exports = {
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
  },
  ListHotkeys: function(){
    return [];
  },
  OnChatMessageCaptured: function(line) {
    if (line.match(/^\[(\d+:)+\d+\] Guard says: Welcome /) !== null) {
      console.log(line.match(/^\[(\d+:)+\d+\] Guard says: Welcome /)[0]);
  		argoscripts.SendMessageToSAMP("/paytoll");
  	}
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
  	
  },
  OnCommandRecieved: function(cmd){
    
  }
};