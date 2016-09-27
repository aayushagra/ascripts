//var robot = require("robotjs");
var fs = require('fs');
var argoscripts = {};
var currentchatlogfile = "";

function mkdirSync (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

function getTodayDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  today = mm+'-'+dd+'-'+yyyy;
  return today;
}

module.exports = {
  OnModuleInit: function(fargoscripts){
    mkdirSync("../chatlog_archive");
  	argoscripts = fargoscripts;
  },
  ListHotkeys: function(){
    return [];
  },
  OnChatMessageCaptured: function(line, playername) {
    fs.appendFileSync(currentchatlogfile, line+"\r\n");
  },
  OnNewChatlogStarted: function(data, filepath) {
    var match = data.match(/^\[(\d+):(\d+):(\d+)\]/);
    var time = "";
    if (match !== null){
      time = match[1]+"-"+match[2]+"-"+match[3];
    } else {
      console.log(filepath);
      data =  fs.readFileSync(filepath, 'utf8');
      console.log("Timestamp not found, trying again in 100ms");
      setTimeout(function(){module.exports.OnNewChatlogStarted(data, filepath);}, 250);
      return 1;
    }
    var name = getTodayDate() + "_" +time;
    currentchatlogfile = '../chatlog_archive/'+name+'.txt';
    console.log(currentchatlogfile);
    //data += "\r\n";
    fs.writeFileSync(currentchatlogfile, data, { flag : 'w' }, function(err) {
        if(err) {
            return console.log(err);
        }
    });
  },
  OnTick: function(){
  	
  }
};