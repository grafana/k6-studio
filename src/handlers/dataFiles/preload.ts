import { ipcRenderer } from 'electron'

import { DataFileHandler } from './types'

export function importFile() {
  return ipcRenderer.invoke(DataFileHandler.Import) as Promise<
    string | undefined
  >
}

export function openFile() {
  return ipcRenderer.invoke(DataFileHandler.Open) as Promise<string | undefined>
}
