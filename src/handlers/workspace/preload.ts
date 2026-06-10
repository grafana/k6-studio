import { ipcRenderer } from 'electron'

import {
  FileReferences,
  UpdateFileReferencesPayload,
  UpdateFileReferencesResult,
  WorkspaceHandler,
} from './types'

export function getFileReferences(filePath: string) {
  return ipcRenderer.invoke(
    WorkspaceHandler.GetFileReferences,
    filePath
  ) as Promise<FileReferences>
}

export function updateFileReferences(payload: UpdateFileReferencesPayload) {
  return ipcRenderer.invoke(
    WorkspaceHandler.UpdateFileReferences,
    payload
  ) as Promise<UpdateFileReferencesResult>
}
