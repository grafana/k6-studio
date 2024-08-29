import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron'
import { open, copyFile, writeFile, unlink, FileHandle } from 'fs/promises'
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
import { sendToast } from './utils/electron'
import invariant from 'tiny-invariant'
import { INVALID_FILENAME_CHARS } from './constants/files'
import { generateFileNameWithTimestamp } from './utils/file'
import { HarFile } from './types/har'
import { GeneratorFile } from './types/generator'

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
      devTools: process.env.NODE_ENV === 'development',
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
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return mainWindow
}

app.whenReady().then(() => {
  const mainWindow = createWindow()
  setupProjectStructure()

  watcher = chokidar.watch([RECORDINGS_PATH, GENERATORS_PATH, SCRIPTS_PATH], {
    ignoreInitial: true,
  })

  watcher.on('add', (filePath) => {
    mainWindow.webContents.send('ui:add-file', path.basename(filePath))
  })

  watcher.on('unlink', (filePath) => {
    mainWindow.webContents.send('ui:remove-file', path.basename(filePath))
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

ipcMain.handle('script:open', async (_, fileName: string) => {
  console.log(getFilePathFromName(fileName))
  const fileHandle = await open(getFilePathFromName(fileName), 'r')
  try {
    const script = await fileHandle?.readFile({ encoding: 'utf-8' })

    return { name: fileName, content: script }
  } finally {
    await fileHandle?.close()
  }
})

ipcMain.handle(
  'script:run',
  async (event, scriptPath: string, absolute = false) => {
    console.info('script:run event received')
    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)

    const resolvedScriptPath = absolute
      ? scriptPath
      : getFilePathFromName(scriptPath)

    currentk6Process = await runScript(
      browserWindow,
      resolvedScriptPath,
      proxyPort
    )
  }
)

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
  const fileName = generateFileNameWithTimestamp('har')
  await writeFile(path.join(RECORDINGS_PATH, fileName), data)
  return fileName
})

ipcMain.handle('har:open', async (_, fileName: string): Promise<HarFile> => {
  console.info('har:open event received')
  let fileHandle: FileHandle | undefined
  try {
    fileHandle = await open(path.join(RECORDINGS_PATH, fileName), 'r')
    const data = await fileHandle?.readFile({ encoding: 'utf-8' })
    const har = await JSON.parse(data)

    return { name: fileName, content: har }
  } finally {
    await fileHandle?.close()
  }
})

ipcMain.handle('har:import', async (event) => {
  console.info('har:import event received')

  const browserWindow = browserWindowFromEvent(event)

  const dialogResult = await dialog.showOpenDialog(browserWindow, {
    message: 'Open HAR file',
    properties: ['openFile'],
    defaultPath: RECORDINGS_PATH,
    filters: [{ name: 'HAR', extensions: ['har'] }],
  })

  const filePath = dialogResult.filePaths[0]

  if (dialogResult.canceled || !filePath) {
    return
  }

  await copyFile(filePath, path.join(RECORDINGS_PATH, path.basename(filePath)))

  return path.basename(filePath)
})

// Generator
ipcMain.handle(
  'generator:save',
  async (_, generatorFile: string, fileName: string) => {
    console.info('generator:save event received')

    invariant(!INVALID_FILENAME_CHARS.test(fileName), 'Invalid file name')

    await writeFile(path.join(GENERATORS_PATH, fileName), generatorFile)
    return fileName
  }
)

ipcMain.handle(
  'generator:open',
  async (_, fileName: string): Promise<GeneratorFile> => {
    console.info('generator:open event received')

    let fileHandle: FileHandle | undefined

    try {
      fileHandle = await open(path.join(GENERATORS_PATH, fileName), 'r')

      const data = await fileHandle?.readFile({ encoding: 'utf-8' })
      const generator = await JSON.parse(data)

      return { name: fileName, content: generator }
    } finally {
      await fileHandle?.close()
    }
  }
)

// UI
ipcMain.on('ui:toggle-theme', () => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
})

ipcMain.handle('ui:delete-file', async (_, fileName: string) => {
  console.info('ui:delete-file event received')

  return unlink(getFilePathFromName(fileName))
})

ipcMain.on('ui:open-folder', async (_, fileName: string) => {
  console.info('ui:open-folder event received')
  shell.showItemInFolder(getFilePathFromName(fileName))
})

ipcMain.handle('ui:get-files', () => {
  console.info('ui:get-files event received')
  const recordings = readdirSync(RECORDINGS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'har')
    .map((f) => f.name)

  const generators = readdirSync(GENERATORS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'json')
    .map((f) => f.name)

  const scripts = readdirSync(SCRIPTS_PATH, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.split('.').pop() === 'js')
    .map((f) => f.name)

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

      sendToast(browserWindow.webContents, {
        title: 'Proxy failed to start, restarting...',
        status: 'error',
      })
    },
  })
}

function getFilePathFromName(name: string) {
  invariant(process, 'Only use this function in the main process')

  switch (name.split('.').pop()) {
    case 'har':
      return path.join(RECORDINGS_PATH, name)

    case 'json':
      return path.join(GENERATORS_PATH, name)

    case 'js':
      return path.join(SCRIPTS_PATH, name)

    default:
      throw new Error('Invalid file type')
  }
}
