import { ipcRenderer } from 'electron'

import {
  type DirectoryEntry,
  FileHandler,
  FileOnDisk,
  GetTempPathArgs,
  type ListDirectoryArgs,
  OpenFileResult,
  SaveFilePayload,
} from './types'

export function listDirectory(args: ListDirectoryArgs) {
  return ipcRenderer.invoke(FileHandler.ListDirectory, args) as Promise<
    DirectoryEntry[]
  >
}

export function save(payload: SaveFilePayload) {
  return ipcRenderer.invoke(
    FileHandler.Save,
    payload
  ) as Promise<FileOnDisk | null>
}

export function open(path: string) {
  return ipcRenderer.invoke(FileHandler.Open, path) as Promise<OpenFileResult>
}

export function getTempPath(payload?: GetTempPathArgs) {
  return ipcRenderer.invoke(FileHandler.GetTempPath, payload) as Promise<string>
}
