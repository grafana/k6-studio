import { ipcRenderer, FileFilter } from 'electron'

import { FileContent, FileLocation, FsHandler, StorageLocation } from './types'

export function getTempScriptPath() {
  return ipcRenderer.invoke(FsHandler.GetTempScriptPath) as Promise<string>
}

export function showOpenDialog(filters: FileFilter[]) {
  return ipcRenderer.invoke(FsHandler.ShowOpenDialog, filters) as Promise<
    string | undefined
  >
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

export function openFile(filePath: string) {
  return ipcRenderer.invoke(
    FsHandler.OpenFile,
    filePath
  ) as Promise<FileContent>
}

export function fileExists(filePath: string) {
  return ipcRenderer.invoke(FsHandler.Exists, filePath) as Promise<boolean>
}
