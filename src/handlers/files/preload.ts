import { ipcRenderer } from 'electron'

import { FileOnDisk, FilesHandler, OpenFile } from './types'

export function save(file: OpenFile) {
  return ipcRenderer.invoke(FilesHandler.Save, file) as Promise<
    OpenFile<FileOnDisk>
  >
}
