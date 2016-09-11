var fs = require('fs');

var argoscripts = {};
var mapped_hotkeys = {};
var listhotkeys_array = [];
var hotkeyarray = [];

module.exports = {
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
    obj = JSON.parse(fs.readFileSync('jojo.json', 'utf8'));
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
    //argoscripts.SetLockFile("test", "dadada");
    argoscripts.SendMessageToSAMP(mapped_hotkeys[hotkey_identifier]);
  },
  ListHotkeys: function(){
    return listhotkeys_array;
  },
  OnChatMessageCaptured: function(line) {
  },
  OnTick: function(){
  	
  }
};