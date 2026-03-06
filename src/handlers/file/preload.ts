import { ipcRenderer } from 'electron'

import {
  type DirectoryEntry,
  FileHandler,
  GetTempPathArgs,
  type ListDirectoryArgs,
  OpenFileRequest,
  OpenFileResult,
  SaveFilePayload,
} from './types'

export function listDirectory(args: ListDirectoryArgs) {
  return ipcRenderer.invoke(FileHandler.ListDirectory, args) as Promise<
    DirectoryEntry[]
  >
}

export function save(payload: SaveFilePayload) {
  return ipcRenderer.invoke(FileHandler.Save, payload) as Promise<string>
}

export function open(request: OpenFileRequest) {
  return ipcRenderer.invoke(
    FileHandler.Open,
    request
  ) as Promise<OpenFileResult>
}

export function getTempPath(payload?: GetTempPathArgs) {
  return ipcRenderer.invoke(FileHandler.GetTempPath, payload) as Promise<string>
}
