import { ipcMain } from 'electron'

import { workspaceWindowFromEvent } from '@/utils/electron'

import { WorkspaceHandler } from './types'

export function initialize() {
  ipcMain.handle(WorkspaceHandler.GetWorkspacePath, (event) => {
    const window = workspaceWindowFromEvent(event)

    return window.workspace.path
  })
}
