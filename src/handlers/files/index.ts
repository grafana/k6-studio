import { ipcMain } from 'electron'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { browserWindowFromEvent } from '@/utils/electron'

import { openFile, saveFile } from './operations'
import { FileContent, FilesHandler, OpenFile } from './types'

export function initialize() {
  ipcMain.handle(FilesHandler.Save, async (event, file: OpenFile) => {
    console.log(
      `${FilesHandler.Save} event received for file of type ${file.content.type}`
    )

    invariant(
      !INVALID_FILENAME_CHARS.test(file.location.name),
      'Invalid file name'
    )

    return await saveFile(file)
  })

  ipcMain.handle(
    FilesHandler.Open,
    (event, filePath?: string, expectedType?: FileContent['type']) => {
      console.log(`${FilesHandler.Open} event received for path: ${filePath}`)

      return openFile(browserWindowFromEvent(event), filePath, expectedType)
    }
  )
}
