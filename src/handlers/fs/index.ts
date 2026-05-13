import { app, dialog, ipcMain } from 'electron'
import path from 'path'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'
import { browserWindowFromEvent } from '@/utils/electron'

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

      const result = await dialog.showSaveDialog(browserWindow, {
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
