var fs = require('fs');
var math = require('mathjs');

function distanceBetweenPoints(pa, pb) {
  d1 = pa[0] - pb[0];
  d2 = pa[1] - pb[1];
  d3 = pa[2] - pb[2];
  return math.sqrt(d1*d1 + d2*d2 + d3*d3);
}

var tolls = [
  ["64","-1540","5.0685","6.4"],
  ["76","-1528","5.0947","6.4"],
  ["429.124","610.727","18.932","4"],
  ["422.925","604.481","18.9326","4.6"],
  ["-132.423","486.995","11.5553","4.5"],
  ["-141.076","486.334","11.7694","4.2"],
  ["-9.0048","-1367.95","10.8184","7"],
  ["-27.8907","-1342.8","10.9732","6.6"],
  ["1706.2","411.526","30.6533","4.8"],
  ["1714.49","409.511","30.6921","4.8"],
  ["1693.38","413.088","30.6477","4.6"],
  ["1686.22","415.641","30.6542","4.6"],
  ["-2861.64","-927.562","9.4844","4.2"],
  ["-2880.29","-922.677","9.4922","5.2"],
  ["-99.5834","-932.467","20.1236","4.2"],
  ["-91.4374","-935.272","19.9616","4.2"],
  ["-2667.97","1273.62","55.4297","6"],
  ["-2677.16","1272.95","55.4297","6"],
  ["-2686.46","1275.11","55.4297","5.6"],
  ["-2695.34","1277.12","55.4297","6"],
  ["-1130.25","1118.76","37.8344","5"],
  ["-1123.64","1110.79","37.8819","5"],
  ["-972.26","-340.563","36.445","5.6"],
  ["-962.688","-345.196","36.1011","5"],
]
var intoll = false;

var argoscripts = {};

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
    if (argoscripts.isPlayerDriver())
    {
      var insidenotoll = true;
      if(argoscripts.getCoordinates != false) //Coordinates have been loaded
      {
        var coords = argoscripts.getCoordinates();
        for(var i = 0; i < tolls.length; i++)
        {
          if(distanceBetweenPoints(coords, tolls[i]) <= tolls[i][3])
          {
            insidenotoll = false;
            if(!intoll)
            {
              intoll = true;
              argoscripts.SendMessageToSAMP("/paytoll");
            }
          }
        }
        if(insidenotoll == true) intoll = false;
      }
    }
  },
  OnCommandRecieved: function(cmd){
    
  }
};