import { app, ipcMain } from 'electron'
import * as path from 'pathe'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'
import { browserWindowFromEvent } from '@/utils/electron'
import { showSaveDialog } from '@/utils/fs'

import { FsHandler } from './types'

export function initialize() {
  ipcMain.handle(FsHandler.GetTempScriptPath, () => {
    return path.join(app.getPath('temp'), getTempScriptName())
  })

  ipcMain.handle(
    FsHandler.ShowSaveAsDialog,
    async (event, fileName?: string) => {
      const browserWindow = browserWindowFromEvent(event)

      const defaultPath = path.join(SCRIPTS_PATH, fileName ?? 'script.js')

      const result = await showSaveDialog(browserWindow, {
        defaultPath,
        filters: [{ name: 'k6 test script', extensions: ['js'] }],
      })

      if (result.canceled || !result.filePath) {
        return
      }

      return result.filePath
    }
  )
}
