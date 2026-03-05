import { ipcMain, dialog } from 'electron'
import { copyFile } from 'fs/promises'
import path from 'path'

import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { RecordingData } from '@/types/recordingData'
import { browserWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { Workspace } from '@/utils/workspace'

import { HarHandler } from './types'

export function initialize(workspace: Workspace) {
  ipcMain.handle(
    HarHandler.SaveFile,
    async (_, data: RecordingData, prefix: string) => {
      console.info(`${HarHandler.SaveFile} event received`)

      const har = proxyDataToHar(data.requests, data.browserEvents)
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(har, null, 2),
        directory: workspace.paths.recordings,
        ext: '.har',
        prefix,
      })

      trackEvent({
        event: UsageEventName.RecordingCreated,
      })

      return path.join(workspace.paths.recordings, fileName)
    }
  )

  ipcMain.handle(HarHandler.ImportFile, async (event) => {
    console.info(`${HarHandler.ImportFile} event received`)

    const browserWindow = browserWindowFromEvent(event)

    const dialogResult = await dialog.showOpenDialog(browserWindow, {
      message: 'Import HAR file',
      properties: ['openFile'],
      defaultPath: workspace.paths.recordings,
      filters: [{ name: 'HAR', extensions: ['har'] }],
    })

    const filePath = dialogResult.filePaths[0]

    if (dialogResult.canceled || !filePath) {
      return
    }

    await copyFile(
      filePath,
      path.join(workspace.paths.recordings, path.basename(filePath))
    )

    trackEvent({
      event: UsageEventName.RecordingImported,
    })

    return path.basename(filePath)
  })
}
