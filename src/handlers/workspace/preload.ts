import { ipcRenderer } from 'electron'

import { FileReferences, WorkspaceHandler } from './types'

export function getFileReferences(filePath: string) {
  return ipcRenderer.invoke(
    WorkspaceHandler.GetFileReferences,
    filePath
  ) as Promise<FileReferences>
}
