import { ipcMain, shell } from 'electron'

import { launchBrowser } from '@/handlers/browser/launch'
import { waitForProxy } from '@/main/proxy'
import { BrowserServer } from '@/services/browser/server'
import { browserWindowFromEvent } from '@/utils/electron'

import { BrowserHandler, LaunchBrowserOptions } from './types'

export function initialize(browserServer: BrowserServer) {
  ipcMain.handle(
    BrowserHandler.Start,
    async (event, options: LaunchBrowserOptions) => {
      console.info(`${BrowserHandler.Start} event received`)

      await waitForProxy()

      const browserWindow = browserWindowFromEvent(event)
      k6StudioState.currentRecordingSession = await launchBrowser(
        browserWindow,
        browserServer,
        options
      )
      console.info('browser started')
    }
  )

  ipcMain.on(BrowserHandler.Stop, () => {
    console.info(`${BrowserHandler.Stop} event received`)

    k6StudioState.currentRecordingSession?.stop()
    k6StudioState.currentRecordingSession = null
  })

  ipcMain.handle(BrowserHandler.OpenExternalLink, (_, url: string) => {
    console.info(`${BrowserHandler.OpenExternalLink} event received`)
    return shell.openExternal(url)
  })

  browserServer.on('stop', () => {
    ipcMain.emit(BrowserHandler.Stop)
  })
}
