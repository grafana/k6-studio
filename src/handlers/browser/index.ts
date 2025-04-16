import { ipcMain, shell } from 'electron'

import { launchBrowser } from '@/browser'
import { waitForProxy } from '@/proxy'
import { BrowserServer } from '@/services/browser/server'
import { browserWindowFromEvent } from '@/utils/electron'

import { BrowserHandler } from './types'

export function initialize(browserServer: BrowserServer) {
  ipcMain.handle(BrowserHandler.Start, async (event, url?: string) => {
    console.info(`${BrowserHandler.Start} event received`)

    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)
    k6StudioState.currentBrowserProcess = await launchBrowser(
      browserWindow,
      browserServer,
      url
    )
    console.info('browser started')
  })

  ipcMain.on(BrowserHandler.Stop, async () => {
    console.info(`${BrowserHandler.Stop} event received`)

    const { currentBrowserProcess } = k6StudioState

    if (currentBrowserProcess) {
      // macOS & windows
      if ('close' in currentBrowserProcess) {
        await currentBrowserProcess.close()
        // linux
      } else {
        currentBrowserProcess.kill()
      }

      k6StudioState.currentBrowserProcess = null
    }
  })

  ipcMain.handle(BrowserHandler.OpenExternalLink, (_, url: string) => {
    console.info(`${BrowserHandler.OpenExternalLink} event received`)
    return shell.openExternal(url)
  })
}
