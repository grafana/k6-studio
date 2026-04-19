import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow, nativeTheme } from 'electron'
import log from 'electron-log/main'
import isSquirrelStartup from 'electron-squirrel-startup'
import path from 'path'
import { updateElectronApp } from 'update-electron-app'

import { getStudioBridgePort } from './bridge/argv'
import { broadcastBridgeEvent } from './bridge/hub'
import { startStudioBridgeServer } from './bridge/server'
import * as handlers from './handlers'
import { ProxyHandler } from './handlers/proxy/types'
import { getBridgeModePageHtml } from './main/bridgeModeHtml'
import { initializeDeepLinks, replayPendingDeepLink } from './main/deepLinks'
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

function isStudioBridgeMode(): boolean {
  return getStudioBridgePort() !== undefined
}

function attachProxyStatusForwarding(mainWindow: BrowserWindow) {
  k6StudioState.proxyEmitter.on('status:change', (status: ProxyStatus) => {
    k6StudioState.proxyStatus = status
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(ProxyHandler.ChangeStatus, status)
    }
    broadcastBridgeEvent(ProxyHandler.ChangeStatus, [status])
  })
}

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
if (isSquirrelStartup) {
  app.quit()
}

initializeLogger()
handlers.initialize()
mainState.initialize()
initializeDeepLinks()

const createBridgeModeWindow = async () => {
  const icon = getAppIcon(process.env.NODE_ENV === 'development')
  if (getPlatform() === 'mac') {
    app.dock?.setIcon(icon)
  }
  app.setName('Grafana k6 Studio')

  const bridgePort = getStudioBridgePort()
  if (bridgePort === undefined) {
    throw new Error('createBridgeModeWindow requires --studio-bridge-port')
  }

  const appearance = k6StudioState.appSettings.appearance.theme
  const resolvedTheme =
    appearance === 'system'
      ? nativeTheme.shouldUseDarkColors
        ? 'dark'
        : 'light'
      : appearance

  await cleanUpProxies()

  const mainWindow = new BrowserWindow({
    width: 520,
    height: 340,
    minWidth: 400,
    minHeight: 280,
    show: false,
    icon,
    title: 'Grafana k6 Studio — Bridge',
    backgroundColor: resolvedTheme === 'light' ? '#fff' : '#111110',
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  mainWindow.once('ready-to-show', () => {
    showWindow(mainWindow)
  })

  configureApplicationMenu()
  // Same workspace file watching as the full UI so web clients (via the bridge)
  // receive ui:add-file / ui:remove-file through broadcastBridgeEvent.
  configureWatcher(mainWindow)
  k6StudioState.wasAppClosedByClient = false

  attachProxyStatusForwarding(mainWindow)

  await configureSystemProxy()

  k6StudioState.currentProxyProcess =
    await launchProxyAndAttachEmitter(mainWindow)

  const html = getBridgeModePageHtml({
    bridgePort,
    theme: resolvedTheme,
  })
  await mainWindow.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(html)
  )

  mainWindow.on('closed', () => {
    k6StudioState.proxyEmitter.removeAllListeners('status:change')
    app.quit()
  })

  return mainWindow
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

  mainWindow.once('ready-to-show', () => {
    showWindow(mainWindow)
  })

  configureApplicationMenu()
  configureWatcher(mainWindow)
  k6StudioState.wasAppClosedByClient = false

  attachProxyStatusForwarding(mainWindow)

  // Configure proxy settings for `fetch`.
  await configureSystemProxy()

  // Start proxy
  k6StudioState.currentProxyProcess =
    await launchProxyAndAttachEmitter(mainWindow)

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  replayPendingDeepLink()

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
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

    await setupProjectStructure()
    await initEventTracking()

    const bridgePort = getStudioBridgePort()
    if (bridgePort !== undefined) {
      startStudioBridgeServer(bridgePort)
    }

    if (isStudioBridgeMode()) {
      await createBridgeModeWindow()
    } else {
      await createWindow()
    }
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
    if (isStudioBridgeMode()) {
      await createBridgeModeWindow()
    } else {
      await createWindow()
    }
    // Window is already shown by the 'ready-to-show' event handler
  }
})

app.on('before-quit', async () => {
  k6StudioState.appShuttingDown = true
  await closeWatcher()
  return stopProxyProcess()
})
