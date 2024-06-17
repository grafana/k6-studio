import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import { launchProxy, type ProxyProcess } from './proxy'
import { launchBrowser } from './browser'
import { Process } from '@puppeteer/browsers'
import { runScript, showScriptSelectDialog, type K6Process } from './script'
import { writeFile } from 'fs/promises'

let currentProxyProcess: ProxyProcess | null
let currentBrowserProcess: Process | null
let currentk6Process: K6Process | null

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  // wait for the window to be ready before showing it. It prevents showing a white page on longer load times.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'detach' })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// https://github.com/electron/electron/pull/21972
app.whenReady().then(() => {
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Proxy
ipcMain.on('proxy:start', async (event) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = launchProxy(browserWindow)
})

ipcMain.on('proxy:stop', async () => {
  console.info('proxy:stop event received')
  if (currentProxyProcess) {
    currentProxyProcess.kill()
    currentProxyProcess = null
  }
})

// Browser
ipcMain.on('browser:start', async (event) => {
  console.info('browser:start event received')
  const browserWindow = browserWindowFromEvent(event)

  currentBrowserProcess = await launchBrowser()
  browserWindow.webContents.send('browser:started')
  console.info('browser:started event sent')
})

ipcMain.on('browser:stop', async () => {
  console.info('browser:stop event received')
  if (currentBrowserProcess) {
    currentBrowserProcess.close()
    currentBrowserProcess = null
  }
})

// Script
ipcMain.handle('script:select', async (event) => {
  console.info('script:select event received')
  const browserWindow = browserWindowFromEvent(event)

  const scriptPath = await showScriptSelectDialog(browserWindow)
  console.info(`selected script: ${scriptPath}`)
  return scriptPath
})

ipcMain.on('script:run', async (event, scriptPath: string) => {
  console.info('script:run event received')
  const browserWindow = browserWindowFromEvent(event)

  currentk6Process = await runScript(browserWindow, scriptPath)
})

ipcMain.on('script:stop', () => {
  console.info('script:stop event received')
  if (currentk6Process) {
    currentk6Process.kill()
    currentk6Process = null
  }
})

ipcMain.on('har:save', async (event, data) => {
  console.info('har:save event received')
  const browserWindow = browserWindowFromEvent(event)

  const dialogResult = await dialog.showSaveDialog(browserWindow, {
    message: 'Save HAR file of the recording',
    defaultPath: 'k6-studio-recording.har',
  })

  if (dialogResult.canceled) {
    return
  }

  await writeFile(dialogResult.filePath, data)
})

const browserWindowFromEvent = (
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent
) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if (!browserWindow) {
    throw new Error('failed to obtain browserWindow')
  }

  return browserWindow
}
