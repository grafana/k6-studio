import { ipcMain } from 'electron'

import { updateReferences } from '@/main/workspace'
import { workspaceIndex } from '@/main/workspaceIndex'

import { UpdateFileReferencesPayload, WorkspaceHandler } from './types'

export function initialize() {
  ipcMain.handle(WorkspaceHandler.GetFileReferences, (_, filePath: string) => {
    return workspaceIndex.get(filePath)
  })

  ipcMain.handle(
    WorkspaceHandler.UpdateFileReferences,
    (
      _,
      { oldPath, newPath, referencingFiles }: UpdateFileReferencesPayload
    ) => {
      return updateReferences(oldPath, newPath, referencingFiles)
    }
  )
}
