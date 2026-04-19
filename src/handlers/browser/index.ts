import { ipcMain, shell } from 'electron'

import {
  createRendererRecordingSink,
  runRecordingSessionWithSink,
} from '@/handlers/browser/recordingSession'
import { LaunchBrowserOptions } from '@/recorder/types'
import { browserWindowFromEvent } from '@/utils/electron'

import { BrowserHandler } from './types'

export function initialize() {
  ipcMain.handle(
    BrowserHandler.Start,
    async (event, options: LaunchBrowserOptions) => {
      console.info(`${BrowserHandler.Start} event received`)

      const browserWindow = browserWindowFromEvent(event)

      await runRecordingSessionWithSink(
        createRendererRecordingSink(browserWindow),
        options
      )
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
}
