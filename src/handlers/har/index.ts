import { ipcMain, dialog } from 'electron'
import { readFile, copyFile } from 'fs/promises'
import path from 'path'

import { RECORDINGS_PATH } from '@/constants/workspace'
import { Recording, RecordingSchema } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'

import { HarHandler } from './types'

export function initialize() {
  ipcMain.handle(
    HarHandler.SaveFile,
    async (_, data: Recording, prefix: string) => {
      console.info(`${HarHandler.SaveFile} event received`)

      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(data, null, 2),
        directory: RECORDINGS_PATH,
        ext: '.har',
        prefix,
      })

      trackEvent({
        event: UsageEventName.RecordingCreated,
      })

      return fileName
    }
  )

  ipcMain.handle(
    HarHandler.OpenFile,
    async (_, fileName: string): Promise<Recording> => {
      console.info(`${HarHandler.OpenFile} event received`)

      const data = await readFile(path.join(RECORDINGS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })

      return RecordingSchema.parse(JSON.parse(data))
    }
  )

  ipcMain.handle(HarHandler.ImportFile, async (event) => {
    console.info(`${HarHandler.ImportFile} event received`)

    const browserWindow = browserWindowFromEvent(event)

    const dialogResult = await dialog.showOpenDialog(browserWindow, {
      message: 'Import HAR file',
      properties: ['openFile'],
      defaultPath: RECORDINGS_PATH,
      filters: [{ name: 'HAR', extensions: ['har'] }],
    })

    const filePath = dialogResult.filePaths[0]

    if (dialogResult.canceled || !filePath) {
      return
    }

    await copyFile(
      filePath,
      path.join(RECORDINGS_PATH, path.basename(filePath))
    )

    trackEvent({
      event: UsageEventName.RecordingImported,
    })

    return path.basename(filePath)
  })
}
