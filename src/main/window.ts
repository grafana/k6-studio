import { BrowserWindow } from 'electron'
import log from 'electron-log/main'

import { saveSettings } from './settings'

export function showWindow(browserWindow: BrowserWindow) {
  const { isMaximized } = k6StudioState.appSettings.windowState
  if (isMaximized) {
    browserWindow.maximize()
  } else {
    browserWindow.show()
  }
  browserWindow.focus()
}

export async function trackWindowState(browserWindow: BrowserWindow) {
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
