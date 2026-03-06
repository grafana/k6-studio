import { ipcMain } from 'electron'

import { browserWindowFromEvent } from '@/utils/electron'

import { WorkspaceHandler } from './types'

export function initialize() {
  ipcMain.handle(WorkspaceHandler.GetWorkspacePath, (event) => {
    const window = browserWindowFromEvent(event)

    return window.workspace.path
  })
}
