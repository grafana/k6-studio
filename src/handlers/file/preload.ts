import { ipcRenderer } from 'electron'

import {
  FileHandler,
  GetTempPathArgs,
  OpenFileRequest,
  OpenFileResult,
  SaveFilePayload,
} from './types'

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
