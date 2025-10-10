import { ipcMain, shell } from 'electron'

import { launchBrowser } from '@/handlers/browser/launch'
import { waitForProxy } from '@/main/proxy'
import { BrowserServer } from '@/services/browser/server'
import { browserWindowFromEvent } from '@/utils/electron'
import { HighlightSelector } from 'extension/src/messaging/types'

import { BrowserHandler, LaunchBrowserOptions } from './types'

export function initialize(browserServer: BrowserServer) {
  ipcMain.handle(
    BrowserHandler.Start,
    async (event, options: LaunchBrowserOptions) => {
      console.info(`${BrowserHandler.Start} event received`)

      await waitForProxy()

      const browserWindow = browserWindowFromEvent(event)
      k6StudioState.currentBrowserProcess = await launchBrowser(
        k6StudioState.appSettings.recorder,
        browserWindow,
        browserServer,
        options
      )
      console.info('browser started')
    }
  )

  ipcMain.on(BrowserHandler.Stop, () => {
    console.info(`${BrowserHandler.Stop} event received`)

    k6StudioState.currentBrowserProcess?.kill()
    k6StudioState.currentBrowserProcess = null
  })

  ipcMain.handle(BrowserHandler.OpenExternalLink, (_, url: string) => {
    console.info(`${BrowserHandler.OpenExternalLink} event received`)
    return shell.openExternal(url)
  })

  browserServer.on('stop-recording', () => {
    ipcMain.emit(BrowserHandler.Stop)
  })

  ipcMain.on(
    BrowserHandler.HighlightElement,
    (_event, selector: HighlightSelector | null) => {
      browserServer.send({
        type: 'highlight-elements',
        selector,
      })
    }
  )

  ipcMain.on(BrowserHandler.NavigateTo, (_event, url: string) => {
    browserServer.send({
      type: 'navigate',
      url,
    })
  })
}
