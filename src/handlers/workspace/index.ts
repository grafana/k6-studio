import { ipcMain } from 'electron'

import { workspaceIndex } from '@/main/workspaceIndex'

import { WorkspaceHandler } from './types'

export function initialize() {
  ipcMain.handle(WorkspaceHandler.GetFileReferences, (_, filePath: string) => {
    return workspaceIndex.get(filePath)
  })
}
