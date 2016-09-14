var fs = require('fs');

var argoscripts = {};
var mapped_hotkeys = {};
var listhotkeys_array = [];
var hotkeyarray = [];

module.exports = {
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
    obj = JSON.parse(fs.readFileSync('../hotkeys.json', 'utf8'));
    console.log(obj);
    for(var i = 0; i < obj.length; i++){
      hotkeyarray = obj[i]["Combination"].filter(function(e) { return e !== 'N/A' })
      //console.log(hotkeyarray);
      if(hotkeyarray && hotkeyarray.length){
        listhotkeys_array.push([hotkeyarray,"OnHotkeyPressed"]);
        mapped_hotkeys[hotkeyarray.sort().join("")] = obj[i]["Output"];
      }
    }
  },
  OnHotkeyPressed: function(hotkey_identifier){
    for(var i = 0; i < mapped_hotkeys[hotkey_identifier].length; i++){
      argoscripts.SendMessageToSAMP(mapped_hotkeys[hotkey_identifier][i]);
    }
  },
  ListHotkeys: function(){
    return listhotkeys_array;
  },
  OnChatMessageCaptured: function(line) {
  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
  	
  }
};