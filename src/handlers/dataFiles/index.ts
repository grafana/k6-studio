import { COPYFILE_EXCL } from 'constants'
import { ipcMain, dialog } from 'electron'
import { stat, copyFile, readFile } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { MAX_DATA_FILE_SIZE } from '@/constants/files'
import { DataFilePreview } from '@/types/testData'
import { parseDataFile } from '@/utils/dataFile'
import { browserWindowFromEvent } from '@/utils/electron'

import { DataFileHandler } from './types'

export function initialize() {
  ipcMain.handle(DataFileHandler.Import, async (event) => {
    const browserWindow = browserWindowFromEvent(event)

    const dialogResult = await dialog.showOpenDialog(browserWindow, {
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

    const destPath = path.join(
      browserWindow.workspace.paths.dataFiles,
      path.basename(filePath)
    )
    await copyFile(filePath, destPath, COPYFILE_EXCL)

    return destPath
  })

  ipcMain.handle(
    DataFileHandler.LoadPreview,
    async (event, pathOrFileName: string): Promise<DataFilePreview> => {
      const browserWindow = browserWindowFromEvent(event)

      const filePath = path.isAbsolute(pathOrFileName)
        ? pathOrFileName
        : path.join(browserWindow.workspace.paths.dataFiles, pathOrFileName)
      const fileType = path.extname(filePath).slice(1)

      invariant(
        fileType === 'csv' || fileType === 'json',
        'Unsupported file type'
      )

      const data = await readFile(filePath, {
        flag: 'r',
        encoding: 'utf-8',
      })

      const parsedData = parseDataFile(data, fileType)

      return {
        type: fileType,
        data: parsedData.slice(0, 20),
        props: parsedData[0] ? Object.keys(parsedData[0]) : [],
        total: parsedData.length,
      }
    }
  )
}
