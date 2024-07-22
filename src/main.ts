import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron'
import { open, writeFile } from 'fs/promises'
import path from 'path'
import { Process } from '@puppeteer/browsers'

import { launchProxy, type ProxyProcess } from './proxy'
import { launchBrowser } from './browser'
import { runScript, showScriptSelectDialog, type K6Process } from './script'
import { setupProjectStructure } from './utils/workflow'
import eventEmmitter from 'events'

const proxyEmitter = new eventEmmitter()

let currentProxyProcess: ProxyProcess | null
let proxyReady = false

let currentBrowserProcess: Process | null
let currentk6Process: K6Process | null

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Start proxy
  currentProxyProcess = launchProxyAndAttachEmitter(mainWindow)

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
app.whenReady().then(async () => {
  createWindow()
  await setupProjectStructure()
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
ipcMain.handle('proxy:start', async (event) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = launchProxyAndAttachEmitter(browserWindow)
})

ipcMain.on('proxy:stop', async () => {
  console.info('proxy:stop event received')
  if (currentProxyProcess) {
    currentProxyProcess.kill()
    currentProxyProcess = null
    proxyReady = false
  }
})

const waitForProxy = async (): Promise<void> => {
  if (proxyReady) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    proxyEmitter.once('ready', () => {
      resolve()
    })
  })
}

// Browser
ipcMain.handle('browser:start', async () => {
  console.info('browser:start event received')

  await waitForProxy()

  currentBrowserProcess = await launchBrowser()
  console.info('browser started')
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

ipcMain.handle('script:run', async (event, scriptPath: string) => {
  console.info('script:run event received')
  await waitForProxy()

  const browserWindow = browserWindowFromEvent(event)

  currentk6Process = await runScript(browserWindow, scriptPath)
})

ipcMain.on('script:stop', (event) => {
  console.info('script:stop event received')
  if (currentk6Process) {
    currentk6Process.kill()
    currentk6Process = null
  }

  const browserWindow = browserWindowFromEvent(event)
  browserWindow.webContents.send('script:stopped')
})

ipcMain.on('script:save', async (event, script: string) => {
  console.info('script:save event received')

  const browserWindow = browserWindowFromEvent(event)
  const dialogResult = await dialog.showSaveDialog(browserWindow, {
    message: 'Save test script',
    defaultPath: 'script.js',
    filters: [{ name: 'JavaScript', extensions: ['js'] }],
  })

  if (dialogResult.canceled) {
    return
  }

  await writeFile(dialogResult.filePath, script)
})

// HAR
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

ipcMain.handle('har:open', async (event, filePath?: string) => {
  console.info('har:open event received')
  const browserWindow = browserWindowFromEvent(event)

  if (filePath) {
    return loadHarFile(filePath)
  }

  const dialogResult = await dialog.showOpenDialog(browserWindow, {
    message: 'Open HAR file',
    properties: ['openFile'],
    filters: [{ name: 'HAR', extensions: ['har'] }],
  })

  if (!dialogResult.canceled && dialogResult.filePaths[0]) {
    return loadHarFile(dialogResult.filePaths[0])
  }

  return
})

const loadHarFile = async (filePath: string) => {
  const fileHandle = await open(filePath, 'r')
  try {
    const data = await fileHandle?.readFile({ encoding: 'utf-8' })
    const har = await JSON.parse(data)

    return { path: filePath, content: har }
  } finally {
    await fileHandle?.close()
  }
}

ipcMain.on('generator:save', async (event, generatorFile: string) => {
  console.info('generator:save event received')

  const browserWindow = browserWindowFromEvent(event)
  const dialogResult = await dialog.showSaveDialog(browserWindow, {
    message: 'Save Generator',
    defaultPath: 'generator.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (dialogResult.canceled) {
    return
  }

  await writeFile(dialogResult.filePath, generatorFile)
})

ipcMain.handle('generator:open', async (event) => {
  console.info('generator:open event received')
  const browserWindow = browserWindowFromEvent(event)

  const dialogResult = await dialog.showOpenDialog(browserWindow, {
    message: 'Open Generator file',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (!dialogResult.canceled && dialogResult.filePaths[0]) {
    const fileHandle = await open(dialogResult.filePaths[0], 'r')
    try {
      const data = await fileHandle?.readFile({ encoding: 'utf-8' })
      // TODO: we might want to send an error on wrong file, a system to send and show errors from the main process
      // could be levereged for many things mmmm
      const generator = await JSON.parse(data)

      return { path: dialogResult.filePaths[0], content: generator }
    } finally {
      await fileHandle?.close()
    }
  }

  return
})

// Settings
ipcMain.on('settings:toggle-theme', () => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
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

const launchProxyAndAttachEmitter = (browserWindow: BrowserWindow) => {
  return launchProxy(browserWindow, {
    onReady: () => {
      proxyReady = true
      proxyEmitter.emit('ready')
    },
  })
}
