import { app, ipcMain } from 'electron'
import path from 'path'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'

import { FsHandler } from './types'

export function initialize() {
  ipcMain.handle(FsHandler.GetTempScriptPath, () => {
    return path.join(app.getPath('temp'), getTempScriptName())
  })

  ipcMain.handle(FsHandler.ShowSaveAsDialog, (_, fileName: string) => {
    return path.join(SCRIPTS_PATH, fileName)
  })
}
