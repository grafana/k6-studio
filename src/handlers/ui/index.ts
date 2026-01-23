import { ipcMain, nativeTheme, shell, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { Dirent } from 'fs'
import { unlink, readdir, access, rename } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { PROJECT_PATH } from '@/constants/workspace'
import { getFilePath } from '@/main/file'
import { StudioFile } from '@/types'
import { getBrowserPath } from '@/utils/browser'
import { reportNewIssue } from '@/utils/bugReport'
import { sendToast } from '@/utils/electron'
import { isNodeJsErrnoException } from '@/utils/typescript'

import { UIHandler } from './types'

export function initialize() {
  ipcMain.on(UIHandler.ToggleTheme, () => {
    console.info(`${UIHandler.ToggleTheme} event received`)
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
  })

  ipcMain.handle(UIHandler.DetectBrowser, async () => {
    console.info(`${UIHandler.DetectBrowser} event received`)
    try {
      const browserPath = await getBrowserPath(
        k6StudioState.appSettings.recorder
      )
      return browserPath !== ''
    } catch {
      log.error('Failed to find browser executable')
    }

    return false
  })

  ipcMain.handle(UIHandler.DeleteFile, async (_, file: StudioFile) => {
    console.info(`${UIHandler.DeleteFile} event received`)

    const filePath = getFilePath(file)
    return unlink(filePath)
  })

  ipcMain.on(UIHandler.OpenFolder, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFolder} event received`)
    const filePath = getFilePath(file)
    return shell.showItemInFolder(filePath)
  })

  ipcMain.handle(UIHandler.OpenFileInDefaultApp, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFileInDefaultApp} event received`)
    const filePath = getFilePath(file)
    return shell.openPath(filePath)
  })

  ipcMain.handle(UIHandler.GetFiles, async () => {
    console.info(`${UIHandler.GetFiles} event received`)

    const allFiles = await readdir(PROJECT_PATH, {
      recursive: true,
      withFileTypes: true,
    })

    const filesByExtension = Object.groupBy(allFiles.toSorted(), (file) =>
      path.extname(file.name).toLowerCase()
    )

    function toStudioFile(type: StudioFile['type']) {
      return (file: Dirent<string>): StudioFile => {
        const parsedName = path.parse(file.name)

        return {
          type,
          displayName: parsedName.name,
          fileName: parsedName.base,
          filePath: path.join(file.parentPath, file.name),
        }
      }
    }

    const recordings: StudioFile[] =
      filesByExtension['.har']?.map(toStudioFile('recording')) ?? []

    const generators =
      filesByExtension['.k6g']?.map(toStudioFile('generator')) ?? []

    const browserTests =
      filesByExtension['.k6b']?.map(toStudioFile('browser-test')) ?? []

    const scripts = [
      ...(filesByExtension['.js']?.map(toStudioFile('script')) ?? []),
      ...(filesByExtension['.mjs']?.map(toStudioFile('script')) ?? []),
      ...(filesByExtension['.cjs']?.map(toStudioFile('script')) ?? []),
      ...(filesByExtension['.ts']?.map(toStudioFile('script')) ?? []),
    ]

    const dataFiles: StudioFile[] = [
      ...(filesByExtension['.json']?.map(toStudioFile('data-file')) ?? []),
      ...(filesByExtension['.csv']?.map(toStudioFile('data-file')) ?? []),
    ]

    return {
      recordings,
      generators,
      browserTests,
      scripts,
      dataFiles,
    }
  })

  ipcMain.handle(UIHandler.ReportIssue, () => {
    console.info(`${UIHandler.ReportIssue} event received`)
    return reportNewIssue()
  })

  ipcMain.handle(
    UIHandler.RenameFile,
    async (e, file: StudioFile, newFileName: string) => {
      console.info(`${UIHandler.RenameFile} event received`)
      const browserWindow = BrowserWindow.fromWebContents(e.sender)

      try {
        invariant(
          !INVALID_FILENAME_CHARS.test(newFileName),
          'Invalid file name'
        )

        const parsedPath = path.parse(file.filePath)
        const newPath = path.join(parsedPath.dir, newFileName)

        try {
          await access(newPath)
          throw new Error(`File with name ${newFileName} already exists`)
        } catch (error) {
          // Only rename if the error code is ENOENT (file does not exist)
          if (isNodeJsErrnoException(error) && error.code === 'ENOENT') {
            await rename(file.filePath, newPath)

            const parsedNewPath = path.parse(newPath)

            return {
              type: file.type,
              displayName: parsedNewPath.name,
              fileName: parsedNewPath.base,
              filePath: newPath,
            }
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
