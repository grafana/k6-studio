import { ipcRenderer } from 'electron'

import { DataFileHandler } from './types'

export function importFile() {
  return ipcRenderer.invoke(DataFileHandler.Import) as Promise<
    string | undefined
  >
}
