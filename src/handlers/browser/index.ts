import { ipcMain, shell } from 'electron'

import { launchBrowser } from '@/handlers/browser/launch'
import { waitForProxy } from '@/main/proxy'
import { browserWindowFromEvent } from '@/utils/electron'
import { HighlightSelector } from 'extension/src/messaging/types'

import { BrowserLaunchError } from './recorders/types'
import { BrowserHandler, LaunchBrowserOptions } from './types'

export function initialize() {
  ipcMain.handle(
    BrowserHandler.Start,
    async (event, options: LaunchBrowserOptions) => {
      console.info(`${BrowserHandler.Start} event received`)

      await waitForProxy()

      const browserWindow = browserWindowFromEvent(event)

      try {
        k6StudioState.currentRecordingSession = await launchBrowser(
          browserWindow,
          options
        )

        k6StudioState.currentRecordingSession?.on('stop', () => {
          browserWindow.webContents.send(BrowserHandler.Closed)
        })

        console.info('browser started')
      } catch (error) {
        console.error(
          'An unexpected error ocurred while starting recording: ',
          error
        )

        if (error instanceof BrowserLaunchError) {
          browserWindow.webContents.send(BrowserHandler.Error, {
            reason: error.source,
            fatal: true,
          })

          return
        }

        browserWindow.webContents.send(BrowserHandler.Error, {
          reason: 'browser-launch',
          fatal: true,
        })
      }
    }
  )

  ipcMain.on(BrowserHandler.Stop, () => {
    console.info(`${BrowserHandler.Stop} event received`)

    k6StudioState.currentRecordingSession?.stop()
    k6StudioState.currentRecordingSession = null
  })

  ipcMain.on(
    BrowserHandler.HighlightElement,
    (_event, selector: HighlightSelector | null) => {
      k6StudioState.currentRecordingSession?.highlightElement(selector)
    }
  )

  ipcMain.on(BrowserHandler.NavigateTo, (_event, url: string) => {
    k6StudioState.currentRecordingSession?.navigateTo(url)
  })

  // TODO: Move to app or ui. The other handlers in this file are related to recording.
  ipcMain.handle(BrowserHandler.OpenExternalLink, (_, url: string) => {
    console.info(`${BrowserHandler.OpenExternalLink} event received`)
    return shell.openExternal(url)
  })
}
