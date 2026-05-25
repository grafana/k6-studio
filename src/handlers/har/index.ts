import { ipcMain } from 'electron'

import { RECORDINGS_PATH } from '@/constants/workspace'
import { Recording } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import {
  copyFile,
  createFileWithUniqueName,
  writeFile,
  showOpenDialog,
  showSaveDialog,
} from '@/utils/fs'
import * as path from '@/utils/path'

import { HarHandler } from './types'

export function initialize() {
  ipcMain.handle(
    HarHandler.SaveFile,
    async (_, data: Recording, prefix: string) => {
      console.info(`${HarHandler.SaveFile} event received`)

      const filePath = await createFileWithUniqueName({
        data: JSON.stringify(data, null, 2),
        directory: RECORDINGS_PATH,
        ext: '.har',
        prefix,
      })

      trackEvent({
        event: UsageEventName.RecordingCreated,
      })

      return filePath
    }
  )

  ipcMain.handle(
    HarHandler.ExportFile,
    async (event, data: Recording, hint: string) => {
      console.info(`${HarHandler.ExportFile} event received`)

      const browserWindow = browserWindowFromEvent(event)

      const result = await showSaveDialog(browserWindow, {
        defaultPath: path.join(RECORDINGS_PATH, hint),
        filters: [{ name: 'HAR', extensions: ['har'] }],
      })

      if (result.canceled || !result.filePath) {
        return undefined
      }

      await writeFile(result.filePath, JSON.stringify(data, null, 2))

      return result.filePath
    }
  )

  ipcMain.handle(HarHandler.ImportFile, async (event) => {
    console.info(`${HarHandler.ImportFile} event received`)

    const browserWindow = browserWindowFromEvent(event)

    const dialogResult = await showOpenDialog(browserWindow, {
      message: 'Import HAR file',
      properties: ['openFile'],
      defaultPath: RECORDINGS_PATH,
      filters: [{ name: 'HAR', extensions: ['har'] }],
    })

    const filePath = dialogResult.filePaths[0]

    if (dialogResult.canceled || !filePath) {
      return
    }

    const destinationPath = path.join(RECORDINGS_PATH, path.basename(filePath))

    await copyFile(filePath, destinationPath)

    trackEvent({
      event: UsageEventName.RecordingImported,
    })

    return destinationPath
  })
}
