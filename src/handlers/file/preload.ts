import { ipcRenderer } from 'electron'

import {
  FileHandler,
  OpenFileRequest,
  OpenFileResult,
  SaveFilePayload,
} from './types'

export function save(payload: SaveFilePayload) {
  return ipcRenderer.invoke(FileHandler.Save, payload) as Promise<void>
}

export function open(request: OpenFileRequest) {
  return ipcRenderer.invoke(
    FileHandler.Open,
    request
  ) as Promise<OpenFileResult>
}
