import { ipcRenderer, FileFilter } from 'electron'

import { FileContent, FileLocation, FsHandler, StorageLocation } from './types'

export function getTempScriptPath() {
  return ipcRenderer.invoke(FsHandler.GetTempScriptPath) as Promise<string>
}

export function showSaveAsDialog(
  location: StorageLocation,
  filters: FileFilter[]
) {
  return ipcRenderer.invoke(
    FsHandler.ShowSaveAsDialog,
    location,
    filters
  ) as Promise<FileLocation | undefined>
}

export function saveFile(location: FileLocation, content: FileContent) {
  return ipcRenderer.invoke(
    FsHandler.SaveFile,
    location,
    content
  ) as Promise<FileLocation>
}
