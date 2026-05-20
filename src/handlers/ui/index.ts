import { ipcMain, Menu, nativeTheme, shell, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  TEMP_SCRIPT_SUFFIX,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
} from '@/constants/workspace'
import { getStudioFileFromPath } from '@/main/file'
import { StudioFile } from '@/types'
import { getBrowserPath } from '@/utils/browser'
import { reportNewIssue } from '@/utils/bugReport'
import { sendToast } from '@/utils/electron'
import { exists, readdir, rename } from '@/utils/fs'
import * as path from '@/utils/path'

import { MenuItem, UIHandler } from './types'

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

  ipcMain.handle(UIHandler.TrashFile, async (_, file: StudioFile) => {
    console.info(`${UIHandler.TrashFile} event received`)

    return shell.trashItem(path.toNativePath(file.path))
  })

  ipcMain.on(UIHandler.OpenFolder, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFolder} event received`)

    return shell.showItemInFolder(path.toNativePath(file.path))
  })

  ipcMain.handle(UIHandler.OpenFileInDefaultApp, (_, file: StudioFile) => {
    console.info(`${UIHandler.OpenFileInDefaultApp} event received`)

    return shell.openPath(path.toNativePath(file.path))
  })

  ipcMain.handle(UIHandler.GetFiles, async () => {
    console.info(`${UIHandler.GetFiles} event received`)
    const recordings = (await readdir(RECORDINGS_PATH))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(RECORDINGS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const generators = (await readdir(GENERATORS_PATH))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(GENERATORS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const browserTests = (await readdir(BROWSER_TESTS_PATH))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(BROWSER_TESTS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const scripts = (await readdir(SCRIPTS_PATH))
      .filter((f) => f.isFile() && !f.name.endsWith(TEMP_SCRIPT_SUFFIX))
      .map((f) => getStudioFileFromPath(path.join(SCRIPTS_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

    const dataFiles = (await readdir(DATA_FILES_PATH))
      .filter((f) => f.isFile())
      .map((f) => getStudioFileFromPath(path.join(DATA_FILES_PATH, f.name)))
      .filter((f) => typeof f !== 'undefined')

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

        const newPath = path.join(path.dirname(file.path), newFileName)

        if (await exists(newPath)) {
          throw new Error(`File with name ${newFileName} already exists`)
        }

        await rename(file.path, newPath)
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

  ipcMain.on(
    UIHandler.SetMenuItemsEnabled,
    (_, menuItems: MenuItem[], enabled: boolean) => {
      console.info(`${UIHandler.SetMenuItemsEnabled} event received`)

      const menu = Menu.getApplicationMenu()

      if (!menu) {
        return
      }

      for (const item of menuItems) {
        const menuItem = menu.getMenuItemById(item)

        if (!menuItem) {
          console.error(`Menu item with id ${item} not found`)

          continue
        }

        menuItem.enabled = enabled
      }
    }
  )
}
