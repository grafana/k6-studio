import { ipcRenderer } from 'electron'

import { FsHandler } from './types'

export function getTempScriptPath() {
  return ipcRenderer.invoke(FsHandler.GetTempScriptPath) as Promise<string>
}

export function showSaveAsDialog(fileName?: string) {
  return ipcRenderer.invoke(FsHandler.ShowSaveAsDialog, fileName) as Promise<
    string | undefined
  >
}
