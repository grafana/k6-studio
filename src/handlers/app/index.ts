import { ipcMain, app } from 'electron'

import { showWindow } from '@/main/window'
import { browserWindowFromEvent } from '@/utils/electron'

import { AppHandler } from './types'

export function initialize() {
  ipcMain.on(AppHandler.CHANGE_ROUTE, (_, route: string) => {
    k6StudioState.currentClientRoute = route
  })

  ipcMain.on(AppHandler.CLOSE, (event) => {
    console.log(`${AppHandler.CLOSE} event received`)

    k6StudioState.wasAppClosedByClient = true
    if (k6StudioState.appShuttingDown) {
      app.quit()
      return
    }
    const browserWindow = browserWindowFromEvent(event)
    browserWindow.close()
  })

  ipcMain.on(AppHandler.SPLASHSCREEN_CLOSE, (event) => {
    console.log(`${AppHandler.SPLASHSCREEN_CLOSE} event received`)

    const browserWindow = browserWindowFromEvent(event)

    if (
      k6StudioState.splashscreenWindow &&
      !k6StudioState.splashscreenWindow.isDestroyed()
    ) {
      k6StudioState.splashscreenWindow.close()
      showWindow(browserWindow)
    }
  })
}
