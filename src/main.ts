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
import { updateElectronApp } from 'update-electron-app'
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
import { initializeLogger, openLogFolder } from './logger'
import log from 'electron-log/main'
import { AppSettings } from './types/settings'
import {
  getSettings,
  saveSettings,
  selectBrowserExecutable,
  selectUpstreamCertificate,
} from './settings'
import { ProxyStatus } from './types'

// handle auto updates
if (process.env.NODE_ENV !== 'development') {
  updateElectronApp()
}

const proxyEmitter = new eventEmitter()

// Used mainly to avoid starting a new proxy when closing the active one on shutdown
let appShuttingDown: boolean = false
let currentProxyProcess: ProxyProcess | null
let proxyStatus: ProxyStatus = 'offline'
const PROXY_RETRY_LIMIT = 5
let proxyRetryCount = 0
export let appSettings: AppSettings

let currentBrowserProcess: Process | null
let currentk6Process: K6Process | null
let watcher: FSWatcher
let splashscreenWindow: BrowserWindow

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

initializeLogger()

const createSplashWindow = async () => {
  splashscreenWindow = new BrowserWindow({
    width: 700,
    height: 355,
    frame: false,
    show: false,
    alwaysOnTop: true,
  })

  let splashscreenFile: string

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    splashscreenFile = path.join(
      app.getAppPath(),
      'resources',
      'splashscreen.html'
    )
  } else {
    splashscreenFile = path.join(process.resourcesPath, 'splashscreen.html')
  }

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    splashscreenWindow.webContents.openDevTools({ mode: 'detach' })
  }

  splashscreenWindow.loadFile(splashscreenFile)

  // wait for the window to be ready before showing it. It prevents showing a white page on longer load times.
  splashscreenWindow.once('ready-to-show', () => {
    splashscreenWindow.show()
  })

  return splashscreenWindow
}

const createWindow = async () => {
  const icon = getAppIcon(process.env.NODE_ENV === 'development')
  if (getPlatform() === 'mac') {
    app.dock.setIcon(icon)
  }
  app.setName('k6 Studio')

  // clean leftover proxies if any, this might happen on windows
  await cleanUpProxies()

  const { width, height, x, y } = appSettings.windowState

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon,
    title: 'k6 Studio (experimental)',
    backgroundColor: nativeTheme.themeSource === 'light' ? '#fff' : '#111110',
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

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.once('ready-to-show', () => configureWatcher(mainWindow))
  proxyEmitter.on('status:change', (statusName: ProxyStatus) => {
    proxyStatus = statusName
    mainWindow.webContents.send('proxy:status:change', statusName)
  })
  mainWindow.on('closed', () =>
    proxyEmitter.removeAllListeners('status:change')
  )

  mainWindow.on('move', () => trackWindowState(mainWindow))
  mainWindow.on('resize', () => trackWindowState(mainWindow))

  return mainWindow
}

app.whenReady().then(async () => {
  appSettings = await getSettings()
  await createSplashWindow()
  await setupProjectStructure()
  await createWindow()
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
    const mainWindow = await createWindow()
    showWindow(mainWindow)
  }
})

app.on('before-quit', async () => {
  // stop watching files to avoid crash on exit
  appShuttingDown = true
  await watcher.close()
  stopProxyProcess()
})

// Proxy
ipcMain.handle('proxy:start', async (event) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)
})

ipcMain.on('proxy:stop', async () => {
  console.info('proxy:stop event received')
  stopProxyProcess()
})

const waitForProxy = async (): Promise<void> => {
  if (proxyStatus === 'online') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    proxyEmitter.once('ready', () => {
      resolve()
    })
  })
}

// Browser
ipcMain.handle('browser:start', async (event, url?: string) => {
  console.info('browser:start event received')

  await waitForProxy()

  const browserWindow = browserWindowFromEvent(event)
  currentBrowserProcess = await launchBrowser(browserWindow, url)
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
      appSettings.proxy.port
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
        title: 'Failed to export the script',
        status: 'error',
      })
      log.error(error)
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
      log.error(e)
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

ipcMain.on('splashscreen:close', (event) => {
  console.info('splashscreen:close event received')

  const browserWindow = browserWindowFromEvent(event)

  if (splashscreenWindow && !splashscreenWindow.isDestroyed()) {
    splashscreenWindow.close()
    showWindow(browserWindow)
  }
})

ipcMain.handle('browser:open:external:link', (_, url: string) => {
  console.info('browser:open:external:link event received')
  shell.openExternal(url)
})

ipcMain.handle('app:open-log', () => {
  console.info('app:open-log event received')
  openLogFolder()
})

ipcMain.handle('settings:get', async () => {
  console.info('settings:get event received')
  return await getSettings()
})

ipcMain.handle('settings:save', async (event, data: AppSettings) => {
  console.info('settings:save event received')

  const browserWindow = browserWindowFromEvent(event)
  try {
    const modifiedSettings = await saveSettings(data)
    applySettings(modifiedSettings, browserWindow)

    sendToast(browserWindow.webContents, {
      title: 'Settings saved successfully',
      status: 'success',
    })
    return true
  } catch (error) {
    log.error(error)
    sendToast(browserWindow.webContents, {
      title: 'Failed to save settings',
      status: 'error',
    })
    return false
  }
})

ipcMain.handle('settings:select-browser-executable', async () => {
  return selectBrowserExecutable()
})

ipcMain.handle('settings:select-upstream-certificate', async () => {
  return selectUpstreamCertificate()
})

ipcMain.handle('proxy:status:get', async () => {
  console.info('proxy:status:get event received')
  return proxyStatus
})

async function applySettings(
  modifiedSettings: Partial<AppSettings>,
  browserWindow: BrowserWindow
) {
  if (modifiedSettings.proxy) {
    stopProxyProcess()
    appSettings.proxy = modifiedSettings.proxy
    proxyEmitter.emit('status:change', 'restarting')
    currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)
  }
  if (modifiedSettings.recorder) {
    appSettings.recorder = modifiedSettings.recorder
  }
}

const browserWindowFromEvent = (
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent
) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if (!browserWindow) {
    throw new Error('failed to obtain browserWindow')
  }

  return browserWindow
}

const launchProxyAndAttachEmitter = async (browserWindow: BrowserWindow) => {
  const { port, automaticallyFindPort } = appSettings.proxy

  const proxyPort = automaticallyFindPort ? await findOpenPort(port) : port
  appSettings.proxy.port = proxyPort

  console.log(`launching proxy ${JSON.stringify(appSettings.proxy)}`)

  return launchProxy(browserWindow, appSettings.proxy, {
    onReady: () => {
      proxyEmitter.emit('status:change', 'online')
      proxyEmitter.emit('ready')
    },
    onFailure: async () => {
      if (appShuttingDown || proxyStatus === 'restarting') {
        // don't restart the proxy if the app is shutting down or if it's already restarting
        return
      }

      if (proxyRetryCount === PROXY_RETRY_LIMIT && !automaticallyFindPort) {
        proxyRetryCount = 0
        proxyEmitter.emit('status:change', 'offline')

        sendToast(browserWindow.webContents, {
          title: `Port ${proxyPort} is already in use`,
          description:
            'Please select a different port or enable automatic port selection',
          status: 'error',
        })

        return
      }

      proxyRetryCount++
      proxyEmitter.emit('status:change', 'restarting')
      currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)

      sendToast(browserWindow.webContents, {
        title: 'Proxy failed to start, restarting...',
        status: 'error',
      })
    },
  })
}

function showWindow(browserWindow: BrowserWindow) {
  const { isMaximized } = appSettings.windowState
  if (isMaximized) {
    browserWindow.maximize()
  } else {
    browserWindow.show()
  }
  browserWindow.focus()
}

function trackWindowState(browserWindow: BrowserWindow) {
  const { width, height, x, y } = browserWindow.getBounds()
  const isMaximized = browserWindow.isMaximized()
  appSettings.windowState = {
    width,
    height,
    x,
    y,
    isMaximized,
  }
  try {
    saveSettings(appSettings)
  } catch (error) {
    log.error(error)
  }
}

function configureWatcher(browserWindow: BrowserWindow) {
  watcher = watch([RECORDINGS_PATH, GENERATORS_PATH, SCRIPTS_PATH], {
    ignoreInitial: true,
  })

  watcher.on('add', (filePath) => {
    browserWindow.webContents.send('ui:add-file', path.basename(filePath))
  })

  watcher.on('unlink', (filePath) => {
    browserWindow.webContents.send('ui:remove-file', path.basename(filePath))
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
  }
}

const cleanUpProxies = async () => {
  const processList = await find('name', 'k6-studio-proxy', false)
  processList.forEach((proc) => {
    kill(proc.pid)
  })
}
