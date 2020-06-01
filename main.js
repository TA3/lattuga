const { app, BrowserWindow, TouchBar, Menu, MenuItem, Tray, screen, ipcMain} = require('electron');
const { TouchBarLabel, TouchBarButton, TouchBarSlider } = TouchBar;








// MENU
const menu = new Menu()
menu.append(new MenuItem ({
    label: 'About'
 }))

 menu.append(new MenuItem({type: 'separator'}))
 menu.append(new MenuItem ({
    label: 'Quit',
    click() { 
       app.quit()
    }
 }))





 // TIMER
 var targetTime
var minutes = 25

const button = new TouchBarButton({
  label: 'Start',
  accessibilityLabel: 'Start',
  backgroundColor: '#d9c285',
  click: () => {
    count();
  },
});
const backward = new TouchBarButton({
  label: '<',
  accessibilityLabel: 'backward',
  backgroundColor: '#b5a272',
  click: () => {
    changeMinutes(true);
  },
});
const forward = new TouchBarButton({
  label: '>',
  accessibilityLabel: 'forward',
  backgroundColor: '#b5a272',
  width: '50',
  click: () => {
    changeMinutes(false);
  },
});

const slider = new TouchBarSlider({
  label: 'Amount',
  minValue: 5,
  value: minutes,
  maxValue: 120,
  change: (n) => {
    minutes = n
    changeMinutes()

  },
});

let isCounting = false
let pause = false
let seconds
var timer = null
const changeMinutes = (backward) => {
  if (!isCounting) {
    if(backward) {
      if (minutes > 5) {
        minutes -= 5;
      }
    }else if(!backward){
      if(minutes <= 115){
        minutes += 5
      }
    }
    button.label = `${minutes}m timer`;
    win.webContents.send('updateBtn', minutes + "m timer")
  }
}
const clearTimer = () => {
  clearInterval(timer)
  button.label = `${minutes}m timer`;
  isCounting = false,
  backward.enabled = true
  forward.enabled = true
  win.webContents.send('updateBtn', minutes + "m timer")
  tray.setTitle("")
  tray.setImage('./timerTemplate.png')
}

const count = () => {
  if (!isCounting) {
    pause = false
    secondsLeft = minutes * 60
    isCounting = true
    let timeLeft;

    timer = setInterval(()=>{

      if (!pause) {
        backward.enabled = false
        forward.enabled = false
        timeLeft = new Date(secondsLeft * 1000).toISOString().substr(11, 8)
        tray.setTitle(timeLeft)
        button.label = timeLeft
        if((targetTime - (Math.floor(Date.now()/1000))) <= 0){
          clearTimer()
          win.webContents.send('updateBtn', minutes + "m timer")
        }
        win.webContents.send('updateBtn', "Stop")
        secondsLeft--;
      }

    }, 1000)
    tray.setImage('./pauseTemplate.png')
  } else {
    clearTimer()
    win.webContents.send('updateBtn', minutes + "m timer")
  }

  

};


// GUI

// document.querySelector('.forward').addEventListener('click', () => {
//     getData()
// })

ipcMain.on("forward",function (event, arg) {
       
        changeMinutes(false);
       // inform the render process that the assigned task finished. Show a message in html
      // event.sender.send in ipcMain will return the reply to renderprocess
       event.sender.send("minutes-changed", minutes + "m timer"); 
});

ipcMain.on("backward",function (event, arg) {
       
        changeMinutes(true);
       // inform the render process that the assigned task finished. Show a message in html
      // event.sender.send in ipcMain will return the reply to renderprocess
       event.sender.send("minutes-changed", minutes + "m timer"); 
});
ipcMain.on("count",function (event, arg) {
       // inform the render process that the assigned task finished. Show a message in html
      // event.sender.send in ipcMain will return the reply to renderprocess

      if(count()){
        event.sender.send("minutes-changed", minutes + "m timer"); 
      } else{
        event.sender.send("minutes-changed", "Stop"); 
      }
      win.hide()
});

//INIT





var tray
const touchBar = new TouchBar({
  items: [
    backward,
    button,
    forward,
    slider
  ],
});
 var contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
var win = null;
function createWindow () {
   let display = screen.getPrimaryDisplay();
let width = display.bounds.width;
  // Create the browser window.
   win = new BrowserWindow({
    width: 300,
    x: width - 330,
    y: 30,
    height: 40,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.setSkipTaskbar(true);
  app.dock.hide()
  tray = new Tray('./timerTemplate.png')
  //tray.setIgnoreDoubleClickEvents(true)
  // and load the index.html of the app.
  win.loadFile('index.html');
  win.setTouchBar(touchBar);
   tray.on('right-click', function(e){
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.setVisibleOnAllWorkspaces(true); // put the window on all screens
      win.focus(); // focus the window up front on the active screen
      win.setVisibleOnAllWorkspaces(false); // disable all screen behavior
    }
  });
   tray.on('click', function(e){
    if (isCounting && !pause) {
      pause = true
      tray.setImage('./playTemplate.png')
    } else if(pause) {
      pause = false
      tray.setImage('./pauseTemplate.png')
    }
  });
   tray.on('double-click', ()=>{
    clearTimer()
   })

  // tray.setToolTip('This is my application.')
  // tray.setContextMenu(contextMenu)
  win.on('blur', () => {
    win.hide()
  })
}

app.whenReady().then(createWindow)