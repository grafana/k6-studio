import { ipcRenderer } from 'electron'

import { FileContent, FileOnDisk, FilesHandler, OpenFile } from './types'

export function save(file: OpenFile) {
  return ipcRenderer.invoke(FilesHandler.Save, file) as Promise<
    OpenFile<FileOnDisk>
  >
}

export function open(filePath?: string, expectedType?: FileContent['type']) {
  return ipcRenderer.invoke(
    FilesHandler.Open,
    filePath,
    expectedType
  ) as Promise<OpenFile | null>
}
