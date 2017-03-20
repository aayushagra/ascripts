var argoscripts = {};

var math = require('mathjs');

function distanceBetweenPoints(pa, pb) {
  d1 = pa[0] - pb[0];
  d2 = pa[1] - pb[1];
  d3 = pa[2] - pb[2];
  return math.sqrt(d1*d1 + d2*d2 + d3*d3);
}

var paynsprays = [
  ["2074.5","-1831.52","13.5469"],
  ["1025.01","-1032.98","31.8561"],
  ["488.467","-1731.59","11.2324"],
  ["720.126","-467.873","16.3437"],
  ["-1904.51","272.643","41.0469"],
  ["-1420.69","2595.24","55.716"],
  ["-99.8581","1106.04","19.7422"],
  ["1962.22","2162.52","10.8203"],
  ["-2425.29","1031.41","50.3906"],
]
var inpns = false;


module.exports = {
  OnModuleInit: function(fargoscripts){
    argoscripts = fargoscripts;
  },
  ListHotkeys: function(){
    return [];
  },
  OnChatMessageCaptured: function(line) {

  },
  OnNewChatlogStarted: function(data) {
    
  },
  OnTick: function(){
    var insidenopns = true;
    if(argoscripts.getCoordinates != false) //Coordinates have been loaded
  	{
      var coords = argoscripts.getCoordinates();
      for(var i = 0; i < paynsprays.length; i++)
      {
        if(distanceBetweenPoints(coords, paynsprays[i]) <= 5)
        {
          insidenopns = false;
          if(!inpns)
          {
            inpns = true;
            //setTimeout(suspend.resume(), 3000);
            argoscripts.SendMessageToSAMP("/engine");
            argoscripts.SendMessageToSAMP("/repairvehicle");
            argoscripts.SendMessageToSAMP("/engine");
          }
        }
      }
      if(insidenopns == true) inpns = false;
    }
  },
  OnCommandRecieved: function(cmd){
    
  }
};