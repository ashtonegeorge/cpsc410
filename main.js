const { app, BrowserWindow } = require('electron')

const createWindow = () => { // create a basic window for the application to be nested in
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html') // load the index file into the window
}

app.whenReady().then(() => { // this runs when the app is initialized, or when it is started for the first time
  createWindow()
})