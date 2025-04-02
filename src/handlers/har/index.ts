import { ipcMain, dialog } from 'electron'
import { readFile, copyFile } from 'fs/promises'
import path from 'path'

import { RECORDINGS_PATH } from '@/constants/workspace'
import { HarWithOptionalResponse } from '@/types/har'
import { browserWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'

export function initialize() {
  ipcMain.handle(
    'har:save',
    async (_, data: HarWithOptionalResponse, prefix: string) => {
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(data, null, 2),
        directory: RECORDINGS_PATH,
        ext: '.har',
        prefix,
      })

      return fileName
    }
  )

  ipcMain.handle(
    'har:open',
    async (_, fileName: string): Promise<HarWithOptionalResponse> => {
      console.info('har:open event received')
      const data = await readFile(path.join(RECORDINGS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })

      return JSON.parse(data)
    }
  )

  ipcMain.handle('har:import', async (event) => {
    console.info('har:import event received')

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

    return path.basename(filePath)
  })
}
