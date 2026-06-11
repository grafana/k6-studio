import { ipcMain } from 'electron'
import invariant from 'tiny-invariant'

import { MAX_DATA_FILE_SIZE } from '@/constants/files'
import { DATA_FILES_PATH } from '@/constants/workspace'
import { showMessageBox, showOpenDialog } from '@/utils/dialog'
import { browserWindowFromEvent } from '@/utils/electron'
import { copyFile, exists, stat } from '@/utils/fs'
import * as path from '@/utils/path'

import { DataFileHandler } from './types'

export function initialize() {
  ipcMain.handle(DataFileHandler.Import, async (event) => {
    const browserWindow = browserWindowFromEvent(event)

    const dialogResult = await showOpenDialog(browserWindow, {
      message: 'Import data file',
      properties: ['openFile'],
      filters: [{ name: 'Supported data files', extensions: ['csv', 'json'] }],
    })

    const filePath = dialogResult.filePaths[0]

    if (dialogResult.canceled || !filePath) {
      return
    }

    const { size } = await stat(filePath)
    invariant(size <= MAX_DATA_FILE_SIZE, 'File is too large')

    const destinationPath = path.join(DATA_FILES_PATH, path.basename(filePath))

    if (await exists(destinationPath)) {
      const { response } = await showMessageBox(browserWindow, {
        type: 'question',
        buttons: ['Cancel', 'Overwrite'],
        defaultId: 0,
        cancelId: 0,
        message: `"${path.basename(filePath)}" already exists. Do you want to overwrite it?`,
      })

      if (response === 0) {
        return
      }
    }

    await copyFile(filePath, destinationPath)

    return destinationPath
  })
}
