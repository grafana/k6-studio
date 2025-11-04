import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow, nativeTheme } from 'electron'
import log from 'electron-log/main'
import path from 'path'
import { updateElectronApp } from 'update-electron-app'

import * as handlers from './handlers'
import { ProxyHandler } from './handlers/proxy/types'
import { initializeDeepLinks } from './main/deepLinks'
import * as mainState from './main/k6StudioState'
import { initializeLogger } from './main/logger'
import { configureApplicationMenu } from './main/menu'
import {
  cleanUpProxies,
  launchProxyAndAttachEmitter,
  stopProxyProcess,
} from './main/proxy'
import { getSettings, initSettings } from './main/settings'
import { closeWatcher, configureWatcher } from './main/watcher'
import { showWindow, trackWindowState } from './main/window'
import { configureSystemProxy } from './services/http'
import { initEventTracking } from './services/usageTracking'
import { ProxyStatus } from './types'
import { getAppIcon, getPlatform } from './utils/electron'
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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

initializeLogger()
handlers.initialize()
mainState.initialize()
initializeDeepLinks()

const createSplashWindow = async () => {
  k6StudioState.splashscreenWindow = new BrowserWindow({
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
    k6StudioState.splashscreenWindow.webContents.openDevTools({
      mode: 'detach',
    })
  }

  // wait for the window to be ready before showing it. It prevents showing a white page on longer load times.
  k6StudioState.splashscreenWindow.once('ready-to-show', () => {
    if (k6StudioState.splashscreenWindow) {
      k6StudioState.splashscreenWindow.show()
    }
  })

  await k6StudioState.splashscreenWindow.loadFile(splashscreenFile)

  return k6StudioState.splashscreenWindow
}

const createWindow = async () => {
  const icon = getAppIcon(process.env.NODE_ENV === 'development')
  if (getPlatform() === 'mac') {
    app.dock?.setIcon(icon)
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

  configureApplicationMenu()
  configureWatcher(mainWindow)
  k6StudioState.wasAppClosedByClient = false

  k6StudioState.proxyEmitter.on('status:change', (status: ProxyStatus) => {
    k6StudioState.proxyStatus = status
    mainWindow.webContents.send(ProxyHandler.ChangeStatus, status)
  })

  // Configure proxy settings for `fetch`.
  await configureSystemProxy()

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
    if (
      k6StudioState.currentClientRoute.startsWith('/generator') &&
      !k6StudioState.wasAppClosedByClient
    ) {
      event.preventDefault()
    }

    if (
      k6StudioState.currentClientRoute.startsWith('/recorder') &&
      k6StudioState.currentRecordingSession !== null
    ) {
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

    await setupProjectStructure()
    await initEventTracking()
    await createWindow()
  },
  (error) => {
    log.error(error)
  }
)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
    return
  }

  await closeWatcher()
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
  k6StudioState.appShuttingDown = true
  await closeWatcher()
  return stopProxyProcess()
})
