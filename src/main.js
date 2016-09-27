const {app, Tray, Menu, BrowserWindow} = require('electron')
const path = require('path');
//var app = require('app');  // Module to control application life.  
//var BrowserWindow = require('browser-window');  // Module to create native browser window.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const iconPath = path.join(__dirname, 'icon.png');
let appIcon = null;

var argoscripts;
app.on('window-all-closed', () => {
  app.quit()
})

var force_quit = false;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1000, height: 800})

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  //win.webContents.openDevTools()

  win.on('close', function(e){
    if(!force_quit){
      win.webContents.executeJavaScript("alert('This panel will be minimized to the tray');");
      e.preventDefault();
      win.hide();
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })



  appIcon = new Tray(iconPath);
  appIcon.displayBalloon({
                title:'hello',
                content:'world'
            });  
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Show keybinds',
      click: function() {
        win.show();
      }
    },
    { label: 'Hide keybinds',
      click: function() {
        win.hide();
      }
    },
    { label: 'Quit',
      click: function() {
        force_quit = true; app.quit();
      }
    }
  ]);
  appIcon.setToolTip('Exterminator\'s keybinder');
  appIcon.setContextMenu(contextMenu);
  //setTimeout(hide, 5000);
  //setTimeout(show, 10000);
  //win.hide();
}

function hide(){
  return win.hide();
}

function show(){
  return win.show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', function(){
  argoscripts = require("./index.js");
  createWindow();
});

process.on('uncaughtException', function (err) {
  console.trace(err);
  app.quit();
  process.exit(1);
})

//Note: This is the only piece of code that isn't in index.js, which is because i can't export it from main if it's imported from index.js
exports.checkHotkeyExists = function(hotkeyarray){
  return argoscripts.checkHotkeyExists(hotkeyarray);
};
//app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  process.exit(1);
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.