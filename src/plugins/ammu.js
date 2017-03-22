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
    if (line.match(/^\[(\d+:)+\d+\] Welcome to AmmuNation /) !== null) {
      console.log(line.match(/^\[(\d+:)+\d+\] Welcome to AmmuNation /)[0]);
      yield setTimeout(suspend.resume(), 3000); // Time to wait 3 seconds for interior to load, and move a bit from entrance.
  		argoscripts.SendMessageToSAMP("/buyweapon");
  	}
  },
  OnTick: function(){
  	
  }
};
