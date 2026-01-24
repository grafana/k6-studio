import { ipcMain } from 'electron'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'

import { save } from './operations'
import { FilesHandler, OpenFile } from './types'

export function initialize() {
  ipcMain.handle(FilesHandler.Save, async (event, file: OpenFile) => {
    console.log(
      `${FilesHandler.Save} event received for file of type ${file.content.type}`
    )

    invariant(
      !INVALID_FILENAME_CHARS.test(file.location.name),
      'Invalid file name'
    )

    return await save(file)
  })
}
