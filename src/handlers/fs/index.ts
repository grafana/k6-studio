import { ipcMain } from 'electron'
import path from 'path'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'

import { FsHandler } from './types'

export function initialize() {
  ipcMain.handle(FsHandler.GetTempScriptPath, () => {
    return path.join(SCRIPTS_PATH, getTempScriptName())
  })

  ipcMain.handle(FsHandler.GetScriptPath, (_, fileName: string) => {
    return path.join(SCRIPTS_PATH, fileName)
  })
}
