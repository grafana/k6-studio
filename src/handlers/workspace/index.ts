import { ipcMain } from 'electron'

import { browserWindowFromEvent } from '@/utils/electron'

import { WorkspaceHandler } from './types'

export function initialize() {
  ipcMain.handle(WorkspaceHandler.GetWorkspace, (event) => {
    const window = browserWindowFromEvent(event)

    return {
      path: window.workspace.path,
      config: window.workspace.config,
    }
  })
}
