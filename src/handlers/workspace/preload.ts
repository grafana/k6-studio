import { ipcRenderer } from 'electron'

import type { StudioFile } from '@/types'
import type { Workspace } from '@/types/workspace'

import { createListener } from '../utils'

import { WorkspaceHandler } from './types'

export function onAddFile(callback: (path: StudioFile) => void) {
  return createListener(WorkspaceHandler.OnAddFile, callback)
}

export function onRemoveFile(callback: (path: StudioFile) => void) {
  return createListener(WorkspaceHandler.OnRemoveFile, callback)
}

export function onChangeWorkspace(callback: (path: string) => void) {
  return createListener(WorkspaceHandler.OnChangeWorkspace, callback)
}

export function getWorkspace(): Promise<Workspace> {
  return ipcRenderer.invoke(WorkspaceHandler.GetWorkspace) as Promise<Workspace>
}
