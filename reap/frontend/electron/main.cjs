const { app, BrowserWindow } = require('electron')
const path = require('node:path')

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL)

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#fef6f0',
    title: 'REAP Launcher',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html')
    mainWindow.loadFile(indexHtml)
  }

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
