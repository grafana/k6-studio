import { app, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'
import path from 'path'

import { AppHandler } from '@/handlers/app/types'

import { CUSTOM_APP_PROTOCOL } from './deepLinks.constants'

let deepLinkUrl: string | null = null

export function initializeDeepLinks() {
  registerCustomProtocol()
  listenMacOsDeepLink()
  listenWindowsDeepLink()
}

// Register application to handle custom protocol links
function registerCustomProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(CUSTOM_APP_PROTOCOL, process.execPath, [
        path.resolve(process.argv[1] ?? ''),
      ])
    }
  } else {
    app.setAsDefaultProtocolClient(CUSTOM_APP_PROTOCOL)
  }
}

function listenMacOsDeepLink() {
  app.on('open-url', (_, url) => {
    handleDeepLink(url)
  })

  // Handle the case when the app is launched with a custom protocol link
  ipcMain.on(AppHandler.SplashscreenClose, () => {
    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl)
      deepLinkUrl = null
    }
  })
}

// Windows and linux emit second-instance event rather than the open-url event ,
// requiring additional code in order to open the contents of the protocol link
// within the same Electron instance
function listenWindowsDeepLink() {
  const lock = app.requestSingleInstanceLock()

  if (!lock) {
    app.quit()
  } else {
    app.on('second-instance', (_, commands) => {
      const url = commands.find((command) =>
        command.startsWith(`${CUSTOM_APP_PROTOCOL}://`)
      )
      if (url) {
        handleDeepLink(url)
      }
    })
  }

  // Handle the case when the app is launched with a custom protocol link
  void app.whenReady().then(() => {
    const url = process.argv.find((item) =>
      item.startsWith(`${CUSTOM_APP_PROTOCOL}://`)
    )
    if (url) {
      handleDeepLink(url)
    }
  })
}

function handleDeepLink(url: string) {
  const mainWindow = BrowserWindow.getAllWindows()[0]

  // Main window not ready yet, store the URL until splash screen is closed
  if (!mainWindow) {
    deepLinkUrl = url
    return
  }

  const parsedUrl = parseUrl(url)

  // Only handle the 'open' action, e.g. k6-studio://open?path=some/path
  if (!parsedUrl || parsedUrl.hostname !== 'open') {
    return
  }

  const path = parsedUrl.searchParams.get('path')

  mainWindow.webContents.send(AppHandler.DeepLink, path)

  // Restore and focus the main window, needed for windows
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.focus()
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch (error) {
    log.error('Failed to parse deep link URL: ', error)
    return null
  }
}
