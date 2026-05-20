import { app, ipcMain, FileFilter } from 'electron'

import {
  K6_BROWSER_TEST_FILE_EXTENSION,
  K6_GENERATOR_FILE_EXTENSION,
} from '@/constants/files'
import {
  BROWSER_TESTS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
} from '@/constants/workspace'
import { getStudioFileFromPath } from '@/main/file'
import { getTempScriptName } from '@/main/script'
import { browserWindowFromEvent } from '@/utils/electron'
import { readFile, showSaveDialog, writeFile } from '@/utils/fs'
import * as path from '@/utils/path'

import { deserializeContent, serializeContent } from './serialization'
import { FileContent, FileLocation, FsHandler, StorageLocation } from './types'

function getDefaultPath(location: StorageLocation) {
  if (location.type === 'file') {
    return location.path
  }

  if (path.isAbsolute(location.hint)) {
    return location.hint
  }

  switch (path.extname(location.hint)) {
    case K6_GENERATOR_FILE_EXTENSION:
      return path.join(GENERATORS_PATH, `${location.hint}`)

    case K6_BROWSER_TEST_FILE_EXTENSION:
      return path.join(BROWSER_TESTS_PATH, `${location.hint}`)

    case 'script':
      return path.join(SCRIPTS_PATH, location.hint)
  }
}

export function initialize() {
  ipcMain.handle(FsHandler.GetTempScriptPath, () => {
    return path.join(app.getPath('temp'), getTempScriptName())
  })

  ipcMain.handle(
    FsHandler.ShowSaveAsDialog,
    async (event, location: FileLocation, filters: FileFilter[]) => {
      const browserWindow = browserWindowFromEvent(event)

      const result = await showSaveDialog(browserWindow, {
        defaultPath: getDefaultPath(location),
        filters,
      })

      if (result.canceled || !result.filePath) {
        return
      }

      return { type: 'file' as const, path: result.filePath }
    }
  )

  ipcMain.handle(
    FsHandler.SaveFile,
    async (_, location: FileLocation, content: FileContent) => {
      const serializedContent = serializeContent(location.path, content)

      await writeFile(location.path, serializedContent)

      return location
    }
  )

  ipcMain.handle(
    FsHandler.OpenFile,
    async (_, filePath: string): Promise<FileContent> => {
      const file = getStudioFileFromPath(filePath)

      if (!file) {
        return { type: 'unsupported' }
      }

      const raw = await readFile(filePath, { encoding: 'utf-8', flag: 'r' })

      return deserializeContent(filePath, raw, file.type)
    }
  )
}
