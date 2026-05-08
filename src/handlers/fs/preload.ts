import { ipcRenderer } from 'electron'

import { FsHandler } from './types'

export function getTempScriptPath() {
  return ipcRenderer.invoke(FsHandler.GetTempScriptPath) as Promise<string>
}

export function getScriptPath(fileName: string) {
  return ipcRenderer.invoke(
    FsHandler.GetScriptPath,
    fileName
  ) as Promise<string>
}
