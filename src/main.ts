import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron'
import { open, writeFile, unlink } from 'fs/promises'
import { readdirSync } from 'fs'
import path from 'path'
import eventEmmitter from 'events'
import { Process } from '@puppeteer/browsers'
import chokidar from 'chokidar'

import { launchProxy, type ProxyProcess } from './proxy'
import { launchBrowser } from './browser'
import { runScript, showScriptSelectDialog, type K6Process } from './script'
import { setupProjectStructure } from './utils/workspace'
import {
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from './constants/workspace'

const proxyEmitter = new eventEmmitter()

let currentProxyProcess: ProxyProcess | null
let proxyReady = false
export let proxyPort = 8080

let currentBrowserProcess: Process | null
let currentk6Process: K6Process | null
let watcher: chokidar.FSWatcher

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

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// https://github.com/electron/electron/pull/21972
app.whenReady().then(() => {
  const mainWindow = createWindow()
  setupProjectStructure()

  watcher = chokidar.watch([RECORDINGS_PATH, GENERATORS_PATH, SCRIPTS_PATH], {
    ignoreInitial: true,
  })

  watcher.on('add', (path) => {
    mainWindow.webContents.send('ui:add-file', path)
  })

  watcher.on('unlink', (path) => {
    mainWindow.webContents.send('ui:remove-file', path)
  })
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

app.on('before-quit', async () => {
  // stop watching files to avoid crash on exit
  await watcher.close()
})

// Proxy
ipcMain.handle('proxy:start', async (event, port?: number) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = launchProxyAndAttachEmitter(browserWindow, port)
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

  if (!scriptPath) return

  const fileHandle = await open(scriptPath, 'r')
  try {
    const script = await fileHandle?.readFile({ encoding: 'utf-8' })

    return { path: scriptPath, content: script }
  } finally {
    await fileHandle?.close()
  }
})

ipcMain.handle('script:open', async (_, filePath: string) => {
  const fileHandle = await open(filePath, 'r')
  try {
    const script = await fileHandle?.readFile({ encoding: 'utf-8' })

    return { path: filePath, content: script }
  } finally {
    await fileHandle?.close()
  }
})

ipcMain.handle('script:run', async (event, scriptPath: string) => {
  console.info('script:run event received')
  await waitForProxy()

  const browserWindow = browserWindowFromEvent(event)

  currentk6Process = await runScript(browserWindow, scriptPath, proxyPort)
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
    defaultPath: path.join(SCRIPTS_PATH, 'script.js'),
    filters: [{ name: 'JavaScript', extensions: ['js'] }],
  })

  if (dialogResult.canceled) {
    return
  }

  await writeFile(dialogResult.filePath, script)
})

// HAR
ipcMain.handle('har:save', async (_, data) => {
  const fineName = `${new Date().toISOString()}.har`
  await writeFile(path.join(RECORDINGS_PATH, fineName), data)
  return path.join(RECORDINGS_PATH, fineName)
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
    defaultPath: RECORDINGS_PATH,
    filters: [{ name: 'HAR', extensions: ['har'] }],
  })

  if (!dialogResult.canceled && dialogResult.filePaths[0]) {
    return loadHarFile(dialogResult.filePaths[0])
  }

  return
})

ipcMain.handle('har:delete', async (_, filePath: string) => {
  console.info('har:delete event received')
  return unlink(filePath)
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

// Generator
ipcMain.handle(
  'generator:save',
  async (_, generatorFile: string, fileName: string) => {
    console.info('generator:save event received')

    await writeFile(path.join(GENERATORS_PATH, fileName), generatorFile)
    return path.join(GENERATORS_PATH, fileName)
  }
)

ipcMain.handle('generator:open', async (event, path?: string) => {
  console.info('generator:open event received')
  const browserWindow = browserWindowFromEvent(event)

  let filePath = path

  if (!filePath) {
    console.log('no path provided, opening dialog', event, path, filePath)
    const dialogResult = await dialog.showOpenDialog(browserWindow, {
      message: 'Open Generator file',
      properties: ['openFile'],
      defaultPath: GENERATORS_PATH,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (dialogResult.canceled || !dialogResult.filePaths[0] || !path) {
      return
    }

    filePath = dialogResult.filePaths[0]
  }

  const fileHandle = await open(filePath, 'r')
  try {
    const data = await fileHandle?.readFile({ encoding: 'utf-8' })
    // TODO: we might want to send an error on wrong file, a system to send and show errors from the main process
    // could be leveraged for many things
    const generator = await JSON.parse(data)

    return { path: filePath, content: generator }
  } finally {
    await fileHandle?.close()
  }
})

// UI
ipcMain.on('ui:toggle-theme', () => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
})

ipcMain.handle('ui:get-files', () => {
  console.info('ui:get-files event received')
  const recordings = readdirSync(RECORDINGS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'har')
    .map((f) => path.join(RECORDINGS_PATH, f.name))

  const generators = readdirSync(GENERATORS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'json')
    .map((f) => path.join(GENERATORS_PATH, f.name))

  const scripts = readdirSync(SCRIPTS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'js')
    .map((f) => path.join(SCRIPTS_PATH, f.name))

  return {
    recordings,
    generators,
    scripts,
  }
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

const launchProxyAndAttachEmitter = (
  browserWindow: BrowserWindow,
  port?: number
) => {
  return launchProxy(browserWindow, port, {
    onReady: () => {
      proxyReady = true
      proxyEmitter.emit('ready')
    },
    onFailure: () => {
      proxyReady = false
      proxyPort += 10
      currentProxyProcess = launchProxyAndAttachEmitter(
        browserWindow,
        proxyPort
      )
    },
  })
}
