import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron'
import {
  access,
  copyFile,
  writeFile,
  unlink,
  readdir,
  rename,
  readFile,
  stat,
} from 'fs/promises'
import { updateElectronApp } from 'update-electron-app'
import path from 'path'
import eventEmitter from 'events'
import { Process } from '@puppeteer/browsers'
import { watch, FSWatcher } from 'chokidar'

import { launchProxy, type ProxyProcess } from './proxy'
import { getBrowserPath, launchBrowser } from './browser'
import { runScript, showScriptSelectDialog, type K6Process } from './script'
import { setupProjectStructure } from './utils/workspace'
import {
  DATA_FILES_PATH,
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
  TEMP_GENERATOR_SCRIPT_PATH,
  TEMP_SCRIPT_SUFFIX,
} from './constants/workspace'
import {
  sendToast,
  findOpenPort,
  getAppIcon,
  getPlatform,
} from './utils/electron'
import invariant from 'tiny-invariant'
import { MAX_DATA_FILE_SIZE, INVALID_FILENAME_CHARS } from './constants/files'
import { HarWithOptionalResponse } from './types/har'
import { GeneratorFileData } from './types/generator'
import kill from 'tree-kill'
import find from 'find-process'
import { getLogContent, initializeLogger, openLogFolder } from './logger'
import log from 'electron-log/main'
import { sendReport } from './usageReport'
import { AppSettings } from './types/settings'
import {
  defaultSettings,
  getSettings,
  initSettings,
  saveSettings,
  selectBrowserExecutable,
  selectUpstreamCertificate,
} from './settings'
import { ProxyStatus, StudioFile } from './types'
import { configureApplicationMenu } from './menu'
import * as Sentry from '@sentry/electron/main'
import { exhaustive, isNodeJsErrnoException } from './utils/typescript'
import { DataFilePreview } from './types/testData'
import { parseDataFile } from './utils/dataFile'
import { createNewGeneratorFile } from './utils/generator'
import { GeneratorFileDataSchema } from './schemas/generator'
import { BrowserServer } from './services/browser/server'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { COPYFILE_EXCL } from 'constants'

import * as handlers from './handlers'

if (process.env.NODE_ENV !== 'development') {
  // handle auto updates
  updateElectronApp()

  // initialize Sentry
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.electronMinidumpIntegration()],

    // conditionally send the event based on the user's settings
    beforeSend: (event) => {
      if (appSettings.telemetry.errorReport) {
        return event
      }
      return null
    },
  })
}

const proxyEmitter = new eventEmitter<{
  'status:change': [ProxyStatus]
  ready: [void]
}>()

// Used mainly to avoid starting a new proxy when closing the active one on shutdown
let appShuttingDown: boolean = false
let currentProxyProcess: ProxyProcess | null
let proxyStatus: ProxyStatus = 'offline'
const PROXY_RETRY_LIMIT = 5
let proxyRetryCount = 0
let currentClientRoute = '/'
let wasAppClosedByClient = false
export let appSettings = defaultSettings

let currentBrowserProcess: Process | ChildProcessWithoutNullStreams | null
let currentk6Process: K6Process | null
let watcher: FSWatcher
let splashscreenWindow: BrowserWindow

const browserServer = new BrowserServer()

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

  // wait for the window to be ready before showing it. It prevents showing a white page on longer load times.
  splashscreenWindow.once('ready-to-show', () => {
    splashscreenWindow.show()
  })

  await splashscreenWindow.loadFile(splashscreenFile)

  return splashscreenWindow
}

const createWindow = async () => {
  const icon = getAppIcon(process.env.NODE_ENV === 'development')
  if (getPlatform() === 'mac') {
    app.dock.setIcon(icon)
  }
  app.setName('Grafana k6 Studio')

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
    title: 'Grafana k6 Studio (public preview)',
    backgroundColor: nativeTheme.themeSource === 'light' ? '#fff' : '#111110',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  handlers.initialize({
    browserWindow: mainWindow,
    browserServer,
  })

  configureApplicationMenu()
  configureWatcher(mainWindow)
  wasAppClosedByClient = false

  proxyEmitter.on('status:change', (status: ProxyStatus) => {
    proxyStatus = status
    mainWindow.webContents.send('proxy:status:change', status)
  })

  // Start proxy
  currentProxyProcess = await launchProxyAndAttachEmitter(mainWindow)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', () =>
    proxyEmitter.removeAllListeners('status:change')
  )

  mainWindow.on('moved', () => trackWindowState(mainWindow))
  mainWindow.on('resized', () => trackWindowState(mainWindow))
  mainWindow.on('close', (event) => {
    mainWindow.webContents.send('app:close')
    if (currentClientRoute.startsWith('/generator') && !wasAppClosedByClient) {
      event.preventDefault()
    }
  })

  return mainWindow
}

app.whenReady().then(
  async () => {
    await createSplashWindow()
    await initSettings()
    appSettings = await getSettings()
    nativeTheme.themeSource = appSettings.appearance.theme

    await sendReport(appSettings.telemetry.usageReport)
    await setupProjectStructure()
    await createWindow()
  },
  (error) => {
    log.error(error)
  }
)

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
  return stopProxyProcess()
})

ipcMain.on('app:change-route', (_, route: string) => {
  currentClientRoute = route
})

ipcMain.on('app:close', (event) => {
  console.log('app:close event received')

  wasAppClosedByClient = true
  if (appShuttingDown) {
    app.quit()
    return
  }
  const browserWindow = browserWindowFromEvent(event)
  browserWindow.close()
})

// Proxy
ipcMain.handle('proxy:start', async (event) => {
  console.info('proxy:start event received')

  const browserWindow = browserWindowFromEvent(event)
  currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)
})

ipcMain.on('proxy:stop', () => {
  console.info('proxy:stop event received')
  return stopProxyProcess()
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
  currentBrowserProcess = await launchBrowser(browserWindow, browserServer, url)
  console.info('browser started')
})

ipcMain.on('browser:stop', async () => {
  console.info('browser:stop event received')

  if (currentBrowserProcess) {
    // macOS & windows
    if ('close' in currentBrowserProcess) {
      await currentBrowserProcess.close()
      // linux
    } else {
      currentBrowserProcess.kill()
    }

    currentBrowserProcess = null
  }
})

// Script
ipcMain.handle('script:select', async (event) => {
  console.info('script:select event received')
  const browserWindow = browserWindowFromEvent(event)
  const scriptPath = await showScriptSelectDialog(browserWindow)

  return scriptPath
})

ipcMain.handle(
  'script:open',
  async (_, scriptPath: string, absolute: boolean = false) => {
    const resolvedScriptPath = absolute
      ? scriptPath
      : path.join(SCRIPTS_PATH, scriptPath)

    const script = await readFile(resolvedScriptPath, {
      encoding: 'utf-8',
      flag: 'r',
    })

    return script
  }
)

ipcMain.handle(
  'script:run',
  async (event, scriptPath: string, absolute: boolean = false) => {
    console.info('script:run event received')
    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)

    const resolvedScriptPath = absolute
      ? scriptPath
      : path.join(SCRIPTS_PATH, scriptPath)

    currentk6Process = await runScript({
      browserWindow,
      scriptPath: resolvedScriptPath,
      proxyPort: appSettings.proxy.port,
      usageReport: appSettings.telemetry.usageReport,
    })
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

ipcMain.handle('script:run-from-generator', async (event, script: string) => {
  await writeFile(TEMP_GENERATOR_SCRIPT_PATH, script)

  const browserWindow = browserWindowFromEvent(event)

  currentk6Process = await runScript({
    browserWindow,
    scriptPath: TEMP_GENERATOR_SCRIPT_PATH,
    proxyPort: appSettings.proxy.port,
    usageReport: appSettings.telemetry.usageReport,
  })

  await unlink(TEMP_GENERATOR_SCRIPT_PATH)
})

ipcMain.handle(
  'script:save',
  async (event, script: string, fileName: string = 'script.js') => {
    const browserWindow = browserWindowFromEvent(event)
    try {
      const filePath = path.join(SCRIPTS_PATH, fileName)
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
ipcMain.handle(
  'har:save',
  async (_, data: HarWithOptionalResponse, prefix: string) => {
    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(data, null, 2),
      directory: RECORDINGS_PATH,
      ext: '.har',
      prefix,
    })

    return fileName
  }
)

ipcMain.handle(
  'har:open',
  async (_, fileName: string): Promise<HarWithOptionalResponse> => {
    console.info('har:open event received')
    const data = await readFile(path.join(RECORDINGS_PATH, fileName), {
      encoding: 'utf-8',
      flag: 'r',
    })

    return JSON.parse(data)
  }
)

ipcMain.handle('har:import', async (event) => {
  console.info('har:import event received')

  const browserWindow = browserWindowFromEvent(event)

  const dialogResult = await dialog.showOpenDialog(browserWindow, {
    message: 'Import HAR file',
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
ipcMain.handle('generator:create', async (_, recordingPath: string) => {
  const generator = createNewGeneratorFile(recordingPath)
  const fileName = await createFileWithUniqueName({
    data: JSON.stringify(generator, null, 2),
    directory: GENERATORS_PATH,
    ext: '.json',
    prefix: 'Generator',
  })

  return fileName
})

ipcMain.handle(
  'generator:save',
  async (_, generator: GeneratorFileData, fileName: string) => {
    invariant(!INVALID_FILENAME_CHARS.test(fileName), 'Invalid file name')

    await writeFile(
      path.join(GENERATORS_PATH, fileName),
      JSON.stringify(generator, null, 2)
    )
  }
)

ipcMain.handle(
  'generator:open',
  async (_, fileName: string): Promise<GeneratorFileData> => {
    const data = await readFile(path.join(GENERATORS_PATH, fileName), {
      encoding: 'utf-8',
      flag: 'r',
    })

    return GeneratorFileDataSchema.parse(JSON.parse(data))
  }
)

// UI
ipcMain.on('ui:toggle-theme', () => {
  nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
})

ipcMain.handle('ui:detect-browser', async () => {
  try {
    const browserPath = await getBrowserPath()
    return browserPath !== ''
  } catch {
    log.error('Failed to find browser executable')
  }

  return false
})

ipcMain.handle('ui:delete-file', async (_, file: StudioFile) => {
  console.info('ui:delete-file event received')

  const filePath = getFilePath(file)
  return unlink(filePath)
})

ipcMain.on('ui:open-folder', (_, file: StudioFile) => {
  const filePath = getFilePath(file)
  return shell.showItemInFolder(filePath)
})

ipcMain.handle('ui:open-file-in-default-app', (_, file: StudioFile) => {
  const filePath = getFilePath(file)
  return shell.openPath(filePath)
})

ipcMain.handle('ui:get-files', async () => {
  console.info('ui:get-files event received')
  const recordings = (await readdir(RECORDINGS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(RECORDINGS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const generators = (await readdir(GENERATORS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(GENERATORS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const scripts = (await readdir(SCRIPTS_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile() && !f.name.endsWith(TEMP_SCRIPT_SUFFIX))
    .map((f) => getStudioFileFromPath(path.join(SCRIPTS_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  const dataFiles = (await readdir(DATA_FILES_PATH, { withFileTypes: true }))
    .filter((f) => f.isFile())
    .map((f) => getStudioFileFromPath(path.join(DATA_FILES_PATH, f.name)))
    .filter((f) => typeof f !== 'undefined')

  return {
    recordings,
    generators,
    scripts,
    dataFiles,
  }
})

ipcMain.handle(
  'ui:rename-file',
  async (
    e,
    oldFileName: string,
    newFileName: string,
    type: StudioFile['type']
  ) => {
    const browserWindow = BrowserWindow.fromWebContents(e.sender)

    try {
      invariant(!INVALID_FILENAME_CHARS.test(newFileName), 'Invalid file name')

      const oldPath = getFilePath({
        type,
        fileName: oldFileName,
      })
      const newPath = getFilePath({
        type,
        fileName: newFileName,
      })

      try {
        await access(newPath)
        throw new Error(`File with name ${newFileName} already exists`)
      } catch (error) {
        // Only rename if the error code is ENOENT (file does not exist)
        if (isNodeJsErrnoException(error) && error.code === 'ENOENT') {
          await rename(oldPath, newPath)
          return
        }

        throw error
      }
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

ipcMain.handle('data-file:import', async (event) => {
  const browserWindow = browserWindowFromEvent(event)

  const dialogResult = await dialog.showOpenDialog(browserWindow, {
    message: 'Import data file',
    properties: ['openFile'],
    filters: [{ name: 'Supported data files', extensions: ['csv', 'json'] }],
  })

  const filePath = dialogResult.filePaths[0]

  if (dialogResult.canceled || !filePath) {
    return
  }

  const { size } = await stat(filePath)
  invariant(size <= MAX_DATA_FILE_SIZE, 'File is too large')

  await copyFile(
    filePath,
    path.join(DATA_FILES_PATH, path.basename(filePath)),
    COPYFILE_EXCL
  )

  return path.basename(filePath)
})

ipcMain.handle(
  'data-file:load-preview',
  async (_, fileName: string): Promise<DataFilePreview> => {
    const fileType = fileName.split('.').pop()
    const filePath = path.join(DATA_FILES_PATH, fileName)

    invariant(
      fileType === 'csv' || fileType === 'json',
      'Unsupported file type'
    )

    const data = await readFile(filePath, {
      flag: 'r',
      encoding: 'utf-8',
    })

    const parsedData = parseDataFile(data, fileType)

    return {
      type: fileType,
      data: parsedData.slice(0, 20),
      props: parsedData[0] ? Object.keys(parsedData[0]) : [],
      total: parsedData.length,
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
  return shell.openExternal(url)
})

ipcMain.on('log:open', () => {
  console.info('log:open event received')
  openLogFolder()
})

ipcMain.handle('log:read', () => {
  console.info('log:read event received')
  return getLogContent()
})

ipcMain.handle('settings:get', async () => {
  console.info('settings:get event received')
  return await getSettings()
})

ipcMain.handle('settings:save', async (event, data: AppSettings) => {
  console.info('settings:save event received')

  const browserWindow = browserWindowFromEvent(event)
  try {
    // don't pass fields that are not submitted by the form
    const { windowState: _, ...settings } = data
    const modifiedSettings = await saveSettings(settings)
    await applySettings(modifiedSettings, browserWindow)

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

ipcMain.handle('proxy:status:get', () => {
  console.info('proxy:status:get event received')
  return proxyStatus
})

async function applySettings(
  modifiedSettings: Partial<AppSettings>,
  browserWindow: BrowserWindow
) {
  if (modifiedSettings.proxy) {
    await stopProxyProcess()
    appSettings.proxy = modifiedSettings.proxy
    currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)
  }
  if (modifiedSettings.recorder) {
    appSettings.recorder = modifiedSettings.recorder
  }
  if (modifiedSettings.telemetry) {
    appSettings.telemetry = modifiedSettings.telemetry
  }
  if (modifiedSettings.appearance) {
    appSettings.appearance = modifiedSettings.appearance
    nativeTheme.themeSource = appSettings.appearance.theme
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

  proxyEmitter.emit('status:change', 'starting')

  return launchProxy(browserWindow, appSettings.proxy, {
    onReady: () => {
      proxyEmitter.emit('status:change', 'online')
      proxyEmitter.emit('ready')
    },
    onFailure: async () => {
      if (appShuttingDown || proxyStatus === 'starting') {
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
      proxyEmitter.emit('status:change', 'starting')
      currentProxyProcess = await launchProxyAndAttachEmitter(browserWindow)

      const errorMessage = `Proxy failed to start on port ${proxyPort}, restarting...`
      log.error(errorMessage)
      sendToast(browserWindow.webContents, {
        title: errorMessage,
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

async function trackWindowState(browserWindow: BrowserWindow) {
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
    await saveSettings(appSettings)
  } catch (error) {
    log.error(error)
  }
}

function configureWatcher(browserWindow: BrowserWindow) {
  watcher = watch(
    [RECORDINGS_PATH, GENERATORS_PATH, SCRIPTS_PATH, DATA_FILES_PATH],
    {
      ignoreInitial: true,
    }
  )

  watcher.on('add', (filePath) => {
    const file = getStudioFileFromPath(filePath)

    if (!file || filePath.endsWith(TEMP_SCRIPT_SUFFIX)) {
      return
    }

    browserWindow.webContents.send('ui:add-file', file)
  })

  watcher.on('unlink', (filePath) => {
    const file = getStudioFileFromPath(filePath)

    if (!file || filePath.endsWith(TEMP_SCRIPT_SUFFIX)) {
      return
    }

    browserWindow.webContents.send('ui:remove-file', file)
  })
}

function getStudioFileFromPath(filePath: string): StudioFile | undefined {
  const file = {
    displayName: path.parse(filePath).name,
    fileName: path.basename(filePath),
  }

  if (
    filePath.startsWith(RECORDINGS_PATH) &&
    path.extname(filePath) === '.har'
  ) {
    return {
      type: 'recording',
      ...file,
    }
  }

  if (
    filePath.startsWith(GENERATORS_PATH) &&
    path.extname(filePath) === '.json'
  ) {
    return {
      type: 'generator',
      ...file,
    }
  }

  if (filePath.startsWith(SCRIPTS_PATH) && path.extname(filePath) === '.js') {
    return {
      type: 'script',
      ...file,
    }
  }

  if (
    filePath.startsWith(DATA_FILES_PATH) &&
    (path.extname(filePath) === '.json' || path.extname(filePath) === '.csv')
  ) {
    return {
      type: 'data-file',
      ...file,
    }
  }
}

function getFilePath(
  file: Partial<StudioFile> & Pick<StudioFile, 'type' | 'fileName'>
) {
  switch (file.type) {
    case 'recording':
      return path.join(RECORDINGS_PATH, file.fileName)
    case 'generator':
      return path.join(GENERATORS_PATH, file.fileName)
    case 'script':
      return path.join(SCRIPTS_PATH, file.fileName)
    case 'data-file':
      return path.join(DATA_FILES_PATH, file.fileName)
    default:
      return exhaustive(file.type)
  }
}

const stopProxyProcess = async () => {
  if (currentProxyProcess) {
    currentProxyProcess.kill()
    currentProxyProcess = null

    // kill remaining proxies if any, this might happen on windows
    if (getPlatform() === 'win') {
      await cleanUpProxies()
    }
  }
}

const cleanUpProxies = async () => {
  const processList = await find('name', 'k6-studio-proxy', false)
  processList.forEach((proc) => {
    kill(proc.pid)
  })
}

const createFileWithUniqueName = async ({
  directory,
  data,
  prefix,
  ext,
}: {
  directory: string
  data: string
  prefix: string
  ext: string
}): Promise<string> => {
  const timestamp = new Date().toISOString().split('T')[0] ?? ''
  const template = `${prefix ? `${prefix} - ` : ''}${timestamp}${ext}`

  // Start from 2 as it follows the the OS behavior for duplicate files
  let fileVersion = 2
  let uniqueFileName = template
  let fileCreated = false

  do {
    try {
      // ax+ flag will throw an error if the file already exists
      await writeFile(path.join(directory, uniqueFileName), data, {
        flag: 'ax+',
      })
      fileCreated = true
    } catch (error) {
      if (isNodeJsErrnoException(error) && error.code !== 'EEXIST') {
        throw error
      }

      const { name, ext } = path.parse(template)
      uniqueFileName = `${name} (${fileVersion})${ext}`
      fileVersion++
    }
  } while (!fileCreated)

  return uniqueFileName
}
