import { ipcMain, nativeTheme, shell, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { unlink, readdir, access, rename } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { createStudioFile } from '@/main/file'
import { StudioFile } from '@/types'
import { getBrowserPath } from '@/utils/browser'
import { reportNewIssue } from '@/utils/bugReport'
import { sendToast, browserWindowFromEvent } from '@/utils/electron'
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

    return unlink(file.path)
  })

  ipcMain.on(UIHandler.OpenFolder, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFolder} event received`)

    return shell.showItemInFolder(file.path)
  })

  ipcMain.handle(UIHandler.OpenFileInDefaultApp, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFileInDefaultApp} event received`)

    return shell.openPath(file.path)
  })

  ipcMain.handle(UIHandler.GetFiles, async (event) => {
    console.info(`${UIHandler.GetFiles} event received`)

    const browserWindow = browserWindowFromEvent(event)

    const entries = await readdir(browserWindow.workspace.path, {
      recursive: true,
      withFileTypes: true,
    })

    const recordings: StudioFile[] = []
    const generators: StudioFile[] = []
    const browserTests: StudioFile[] = []
    const scripts: StudioFile[] = []
    const dataFiles: StudioFile[] = []

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue
      }

      const fullPath = path.join(entry.parentPath, entry.name)
      const file = createStudioFile(fullPath)

      if (file === null) {
        continue
      }

      switch (file.type) {
        case 'recording':
          recordings.push(file)
          break

        case 'generator':
          generators.push(file)
          break

        case 'browser-test':
          browserTests.push(file)
          break

        case 'script':
          scripts.push(file)
          break

        case 'data-file':
          dataFiles.push(file)
          break
      }
    }

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
    async (e, oldPath: string, newName: string) => {
      console.info(`${UIHandler.RenameFile} event received`)
      const browserWindow = BrowserWindow.fromWebContents(e.sender)

      try {
        invariant(!INVALID_FILENAME_CHARS.test(newName), 'Invalid file name')

        const newPath = path.join(path.dirname(oldPath), newName)

        try {
          await access(newPath)
          throw new Error(`File with name ${newName} already exists`)
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
