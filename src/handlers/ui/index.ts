import { ipcMain, nativeTheme, shell, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { unlink, readdir, access, rename } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_SCRIPT_SUFFIX,
  DATA_FILES_PATH,
} from '@/constants/workspace'
import { getBrowserPath } from '@/handlers/browser/launch'
import { getFilePath, getStudioFileFromPath } from '@/main/file'
import { StudioFile } from '@/types'
import { reportNewIssue } from '@/utils/bugReport'
import { sendToast } from '@/utils/electron'
import { isNodeJsErrnoException } from '@/utils/typescript'

import { UIHandler } from './types'

export function initialize() {
  ipcMain.on(UIHandler.TOGGLE_THEME, () => {
    console.info(`${UIHandler.TOGGLE_THEME} event received`)
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
  })

  ipcMain.handle(UIHandler.DETECT_BROWSER, async () => {
    console.info(`${UIHandler.DETECT_BROWSER} event received`)
    try {
      const browserPath = await getBrowserPath()
      return browserPath !== ''
    } catch {
      log.error('Failed to find browser executable')
    }

    return false
  })

  ipcMain.handle(UIHandler.DELETE_FILE, async (_, file: StudioFile) => {
    console.info(`${UIHandler.DELETE_FILE} event received`)

    const filePath = getFilePath(file)
    return unlink(filePath)
  })

  ipcMain.on(UIHandler.OPEN_FOLDER, (_, file: StudioFile) => {
    console.info(`${UIHandler.OPEN_FOLDER} event received`)
    const filePath = getFilePath(file)
    return shell.showItemInFolder(filePath)
  })

  ipcMain.handle(UIHandler.OPEN_FILE_IN_DEFAULT_APP, (_, file: StudioFile) => {
    console.info(`${UIHandler.OPEN_FILE_IN_DEFAULT_APP} event received`)
    const filePath = getFilePath(file)
    return shell.openPath(filePath)
  })

  ipcMain.handle(UIHandler.GET_FILES, async () => {
    console.info(`${UIHandler.GET_FILES} event received`)
    const recordings = (await readdir(RECORDINGS_PATH, { withFileTypes: true }))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(RECORDINGS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const generators = (await readdir(GENERATORS_PATH, { withFileTypes: true }))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(GENERATORS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const scripts = (await readdir(SCRIPTS_PATH, { withFileTypes: true }))
      .filter((f) => f.isFile() && !f.name.endsWith(TEMP_SCRIPT_SUFFIX))
      .map((f) => getStudioFileFromPath(path.join(SCRIPTS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const dataFiles = (await readdir(DATA_FILES_PATH, { withFileTypes: true }))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(DATA_FILES_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    return {
      recordings,
      generators,
      scripts,
      dataFiles,
    }
  })

  ipcMain.handle(UIHandler.REPORT_ISSUE, () => {
    console.info(`${UIHandler.REPORT_ISSUE} event received`)
    return reportNewIssue()
  })

  ipcMain.handle(
    UIHandler.RENAME_FILE,
    async (
      e,
      oldFileName: string,
      newFileName: string,
      type: StudioFile['type']
    ) => {
      console.info(`${UIHandler.RENAME_FILE} event received`)
      const browserWindow = BrowserWindow.fromWebContents(e.sender)

      try {
        invariant(
          !INVALID_FILENAME_CHARS.test(newFileName),
          'Invalid file name'
        )

        const oldPath = getFilePath({
          type,
          fileName: oldFileName,
        })
        const newPath = getFilePath({
          type,
          fileName: newFileName,
        })

        try {
          await access(newPath)
          throw new Error(`File with name ${newFileName} already exists`)
        } catch (error) {
          // Only rename if the error code is ENOENT (file does not exist)
          if (isNodeJsErrnoException(error) && error.code === 'ENOENT') {
            await rename(oldPath, newPath)
            return
          }

          throw error
        }
      } catch (e) {
        log.error(e)
        browserWindow &&
          sendToast(browserWindow.webContents, {
            title: 'Failed to rename file',
            description: e instanceof Error ? e.message : undefined,
            status: 'error',
          })

        throw e
      }
    }
  )
}
