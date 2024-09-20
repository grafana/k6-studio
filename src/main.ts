import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron'
import {
  open,
  copyFile,
  writeFile,
  unlink,
  FileHandle,
  rename,
} from 'fs/promises'
import { readdirSync, existsSync } from 'fs'
import path from 'path'
import eventEmitter from 'events'
import { Process } from '@puppeteer/browsers'
import { watch, FSWatcher } from 'chokidar'

import { launchProxy, type ProxyProcess } from './proxy'
import { launchBrowser } from './browser'
import { runScript, showScriptSelectDialog, type K6Process } from './script'
import { setupProjectStructure } from './utils/workspace'
import {
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from './constants/workspace'
import {
  sendToast,
  findOpenPort,
  getAppIcon,
  getPlatform,
} from './utils/electron'
import invariant from 'tiny-invariant'
import { INVALID_FILENAME_CHARS } from './constants/files'
import { generateFileNameWithTimestamp } from './utils/file'
import { HarFile } from './types/har'
import { GeneratorFile } from './types/generator'
import kill from 'tree-kill'
import find from 'find-process'

const proxyEmitter = new eventEmitter()

// Used mainly to avoid starting a new proxy when closing the active one on shutdown
let appShuttingDown: boolean = false
let currentProxyProcess: ProxyProcess | null
let proxyReady = false
export let proxyPort = 6000

let currentBrowserProcess: Process | null
let currentk6Process: K6Process | null
let watcher: FSWatcher

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = async () => {
  const icon = getAppIcon(process.env.NODE_ENV === 'development')
  if (getPlatform() === 'mac') {
    app.dock.setIcon(icon)
  }
  app.setName('k6 Studio')

  // clean leftover proxies if any, this might happen on windows
  await cleanUpProxies()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon,
    title: 'k6 Studio (experimental)',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  // Start proxy
  currentProxyProcess = await launchProxyAndAttachEmitter(mainWindow)

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
    // maximize will also show the window so mainWindow.show() is unneeded
    mainWindow.maximize()
    mainWindow.focus()
  })

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return mainWindow
}

app.whenReady().then(async () => {
  const mainWindow = await createWindow()
  setupProjectStructure()

  watcher = watch([RECORDINGS_PATH, GENERATORS_PATH, SCRIPTS_PATH], {
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

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', async () => {
  // stop watching files to avoid crash on exit
  appShuttingDown = true
  await watcher.close()
  stopProxyProcess()
})

// Proxy
ipcMain.handle('proxy:start', async (event, port?: number) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow, port)
})

ipcMain.on('proxy:stop', async () => {
  console.info('proxy:stop event received')
  stopProxyProcess()
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
ipcMain.handle('browser:start', async (event) => {
  console.info('browser:start event received')

  await waitForProxy()

  const browserWindow = browserWindowFromEvent(event)
  currentBrowserProcess = await launchBrowser(browserWindow)
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
  async (
    event,
    scriptPath: string,
    absolute: boolean = false,
    fromGenerator: boolean = false
  ) => {
    console.info('script:run event received')
    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)

    let resolvedScriptPath

    if (fromGenerator) {
      resolvedScriptPath = path.join(
        app.getPath('temp'),
        'k6-studio-generator-script.js'
      )
    } else {
      resolvedScriptPath = absolute
        ? scriptPath
        : getFilePathFromName(scriptPath)
    }

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

ipcMain.handle('script:save:generator', async (event, script: string) => {
  console.info('script:save:generator event received')
  // we are validating from the generator so we save the script in a temporary directory
  const scriptFromGeneratorPath = path.join(
    app.getPath('temp'),
    'k6-studio-generator-script.js'
  )
  await writeFile(scriptFromGeneratorPath, script)
})

ipcMain.handle(
  'script:save',
  async (event, script: string, fileName: string = 'script.js') => {
    console.info('script:save event received')

    const browserWindow = browserWindowFromEvent(event)
    try {
      const filePath = `${SCRIPTS_PATH}/${fileName}`
      await writeFile(filePath, script)
      sendToast(browserWindow.webContents, {
        title: 'Script exported successfully',
        status: 'success',
      })
    } catch (error) {
      sendToast(browserWindow.webContents, {
        title: 'There was an error exporting the script',
        status: 'error',
      })
    }
  }
)

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

ipcMain.handle(
  'ui:rename-file',
  async (e, oldFileName: string, newFileName: string) => {
    const browserWindow = BrowserWindow.fromWebContents(e.sender)

    try {
      invariant(!INVALID_FILENAME_CHARS.test(newFileName), 'Invalid file name')

      const oldPath = getFilePathFromName(oldFileName)
      const newPath = getFilePathFromName(newFileName)

      if (existsSync(newPath)) {
        throw new Error('File already exists')
      }

      await rename(oldPath, newPath)
    } catch (e) {
      browserWindow &&
        sendToast(browserWindow.webContents, {
          title: 'Failed to rename file',
          description: e instanceof Error ? e.message : undefined,
          status: 'error',
        })

      throw e
    }
  }
)

ipcMain.handle('browser:open:external:link', (_, url: string) => {
  console.info('browser:open:external:link event received')
  shell.openExternal(url)
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

const launchProxyAndAttachEmitter = async (
  browserWindow: BrowserWindow,
  port: number = proxyPort
) => {
  // confirm that the port is still open and if not get the next open one
  const availableOpenport = await findOpenPort(port)
  console.log(`proxy open port found: ${availableOpenport}`)

  if (availableOpenport !== proxyPort) {
    proxyPort = availableOpenport
  }

  return launchProxy(browserWindow, proxyPort, {
    onReady: () => {
      proxyReady = true
      proxyEmitter.emit('ready')
    },
    onFailure: async () => {
      if (appShuttingDown) {
        // we don't have to restart the proxy if the app is shutting down
        return
      }
      proxyReady = false
      currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)

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

const stopProxyProcess = () => {
  if (currentProxyProcess) {
    // NOTE: this might not kill the second spawned process on windows
    currentProxyProcess.kill()
    currentProxyProcess = null
    proxyReady = false
  }
}

const cleanUpProxies = async () => {
  const processList = await find('name', 'k6-studio-proxy', false)
  processList.forEach((proc) => {
    kill(proc.pid)
  })
}
