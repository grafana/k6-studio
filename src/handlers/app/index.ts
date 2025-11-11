import { ipcMain, app } from 'electron'

import { showWindow } from '@/main/window'
import { trackEvent } from '@/services/usageTracking'
import { UsageEvent } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'

import { AppHandler } from './types'

export function initialize() {
  ipcMain.on(AppHandler.ChangeRoute, (_, route: string) => {
    k6StudioState.currentClientRoute = route
  })

  ipcMain.on(AppHandler.Close, (event) => {
    console.log(`${AppHandler.Close} event received`)

    k6StudioState.wasAppClosedByClient = true
    if (k6StudioState.appShuttingDown) {
      app.quit()
      return
    }
    const browserWindow = browserWindowFromEvent(event)
    browserWindow.close()
  })

  ipcMain.on(AppHandler.SplashscreenClose, (event) => {
    console.log(`${AppHandler.SplashscreenClose} event received`)

    const browserWindow = browserWindowFromEvent(event)

    if (
      k6StudioState.splashscreenWindow &&
      !k6StudioState.splashscreenWindow.isDestroyed()
    ) {
      k6StudioState.splashscreenWindow.close()
      showWindow(browserWindow)
    }
  })

  ipcMain.on(AppHandler.TrackEvent, (_, event: UsageEvent) => {
    trackEvent(event)
  })
}
