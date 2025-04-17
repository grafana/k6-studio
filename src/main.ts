import * as Sentry from '@sentry/electron/main'
import { watch, FSWatcher } from 'chokidar'
import { COPYFILE_EXCL } from 'constants'
import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron'
import log from 'electron-log/main'
import { existsSync } from 'fs'
import { copyFile, readdir, rename, readFile, stat } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'
import { updateElectronApp } from 'update-electron-app'

import { MAX_DATA_FILE_SIZE } from './constants/files'
import {
  DATA_FILES_PATH,
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
  TEMP_SCRIPT_SUFFIX,
} from './constants/workspace'
import * as handlers from './handlers'
import { ProxyHandler } from './handlers/proxy/types'
import { UIHandler } from './handlers/ui/types'
import * as mainState from './k6StudioState'
import { getLogContent, initializeLogger, openLogFolder } from './logger'
import { getStudioFileFromPath } from './main/file'
import { configureApplicationMenu } from './menu'
import {
  cleanUpProxies,
  launchProxyAndAttachEmitter,
  stopProxyProcess,
} from './proxy'
import { BrowserServer } from './services/browser/server'
import { getSettings, initSettings, saveSettings } from './settings'
import { ProxyStatus } from './types'
import { DataFilePreview } from './types/testData'
import { sendReport } from './usageReport'
import { parseDataFile } from './utils/dataFile'
import {
  getAppIcon,
  getPlatform,
  browserWindowFromEvent,
} from './utils/electron'
import { setupProjectStructure } from './utils/workspace'

if (process.env.NODE_ENV !== 'development') {
  // handle auto updates
  updateElectronApp()

  // initialize Sentry
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.electronMinidumpIntegration()],

    // conditionally send the event based on the user's settings
    beforeSend: (event) => {
      if (k6StudioState.appSettings.telemetry.errorReport) {
        return event
      }
      return null
    },
  })
}

let currentClientRoute = '/'
let wasAppClosedByClient = false

let watcher: FSWatcher
let splashscreenWindow: BrowserWindow

const browserServer = new BrowserServer()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

initializeLogger()

mainState.initialize()

// Used to convert `.json` files into the appropriate file extension for the Generator
async function migrateJsonGenerator() {
  if (!existsSync(GENERATORS_PATH)) return

  const items = await readdir(GENERATORS_PATH, { withFileTypes: true })
  const files = items.filter(
    (f) => f.isFile() && path.extname(f.name) === '.json'
  )

  await Promise.all(
    files.map(async (f) => {
      try {
        const oldPath = path.join(GENERATORS_PATH, f.name)
        const newPath = path.join(
          GENERATORS_PATH,
          path.parse(f.name).name + '.k6g'
        )
        await rename(oldPath, newPath)
      } catch (error) {
        log.error(error)
      }
    })
  )
}

const createSplashWindow = async () => {
  splashscreenWindow = new BrowserWindow({
    width: 600,
    height: 400,
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

  const { width, height, x, y } = k6StudioState.appSettings.windowState

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
    title: 'Grafana k6 Studio',
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

  k6StudioState.proxyEmitter.on('status:change', (status: ProxyStatus) => {
    k6StudioState.proxyStatus = status
    mainWindow.webContents.send(ProxyHandler.ChangeStatus, status)
  })

  // Start proxy
  k6StudioState.currentProxyProcess =
    await launchProxyAndAttachEmitter(mainWindow)

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
    k6StudioState.proxyEmitter.removeAllListeners('status:change')
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
    await initSettings()
    k6StudioState.appSettings = await getSettings()
    nativeTheme.themeSource = k6StudioState.appSettings.appearance.theme
    await createSplashWindow()

    await sendReport(k6StudioState.appSettings.telemetry.usageReport)
    await setupProjectStructure()
    await migrateJsonGenerator()
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
  k6StudioState.appShuttingDown = true
  await watcher.close()
  return stopProxyProcess()
})

ipcMain.on('app:change-route', (_, route: string) => {
  currentClientRoute = route
})

ipcMain.on('app:close', (event) => {
  console.log('app:close event received')

  wasAppClosedByClient = true
  if (k6StudioState.appShuttingDown) {
    app.quit()
    return
  }
  const browserWindow = browserWindowFromEvent(event)
  browserWindow.close()
})

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

ipcMain.on('log:open', () => {
  console.info('log:open event received')
  openLogFolder()
})

ipcMain.handle('log:read', () => {
  console.info('log:read event received')
  return getLogContent()
})

function showWindow(browserWindow: BrowserWindow) {
  const { isMaximized } = k6StudioState.appSettings.windowState
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
  k6StudioState.appSettings.windowState = {
    width,
    height,
    x,
    y,
    isMaximized,
  }
  try {
    await saveSettings(k6StudioState.appSettings)
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

    browserWindow.webContents.send(UIHandler.ADD_FILE, file)
  })

  watcher.on('unlink', (filePath) => {
    const file = getStudioFileFromPath(filePath)

    if (!file || filePath.endsWith(TEMP_SCRIPT_SUFFIX)) {
      return
    }

    browserWindow.webContents.send(UIHandler.REMOVE_FILE, file)
  })
}
