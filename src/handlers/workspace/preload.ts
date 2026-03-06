import { ipcRenderer } from 'electron'

import { createListener } from '../utils'

import { WorkspaceHandler } from './types'

export function onAddFile(callback: (path: string) => void) {
  return createListener(WorkspaceHandler.OnAddFile, callback)
}

export function onRemoveFile(callback: (path: string) => void) {
  return createListener(WorkspaceHandler.OnRemoveFile, callback)
}

export function onChangeWorkspace(callback: (path: string) => void) {
  return createListener(WorkspaceHandler.OnChangeWorkspace, callback)
}

export function getWorkspacePath() {
  return ipcRenderer.invoke(
    WorkspaceHandler.GetWorkspacePath
  ) as Promise<string>
}
