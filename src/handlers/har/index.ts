import { ipcMain, dialog } from 'electron'
import { copyFile } from 'fs/promises'
import path from 'path'

import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { RecordingData } from '@/types/recordingData'
import { workspaceWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import { HarHandler } from './types'

export function initialize() {
  ipcMain.handle(
    HarHandler.SaveFile,
    async (event, data: RecordingData, prefix: string) => {
      console.info(`${HarHandler.SaveFile} event received`)

      const browserWindow = workspaceWindowFromEvent(event)

      const har = proxyDataToHar(data.requests, data.browserEvents)
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(har, null, 2),
        directory: browserWindow.workspace.paths.recordings,
        ext: '.har',
        prefix,
      })

      trackEvent({
        event: UsageEventName.RecordingCreated,
      })

      return path.join(browserWindow.workspace.paths.recordings, fileName)
    }
  )

  ipcMain.handle(HarHandler.ImportFile, async (event) => {
    console.info(`${HarHandler.ImportFile} event received`)

    const browserWindow = workspaceWindowFromEvent(event)

    const dialogResult = await dialog.showOpenDialog(browserWindow, {
      message: 'Import HAR file',
      properties: ['openFile'],
      defaultPath: browserWindow.workspace.paths.recordings,
      filters: [{ name: 'HAR', extensions: ['har'] }],
    })

    const filePath = dialogResult.filePaths[0]

    if (dialogResult.canceled || !filePath) {
      return
    }

    await copyFile(
      filePath,
      path.join(
        browserWindow.workspace.paths.recordings,
        path.basename(filePath)
      )
    )

    trackEvent({
      event: UsageEventName.RecordingImported,
    })

    return path.basename(filePath)
  })
}
