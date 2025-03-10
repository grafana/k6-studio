import { BrowserWindow, ipcMain } from 'electron'
import { CloudHandlers } from './types'
import { RunInCloudStateMachine } from './states'
import { isAbsolute, join } from 'path'
import { SCRIPTS_PATH } from '@/constants/workspace'

export function initialize(browserWindow: BrowserWindow) {
  let stateMachine: RunInCloudStateMachine | null = null

  ipcMain.handle(CloudHandlers.Run, async (_event, scriptName: string) => {
    try {
      if (stateMachine !== null) {
        stateMachine.abort()
      }

      stateMachine = new RunInCloudStateMachine(
        !isAbsolute(scriptName) ? join(SCRIPTS_PATH, scriptName) : scriptName
      )

      stateMachine.on('state-change', (state) => {
        browserWindow.webContents.send('cloud:state-change', state)
      })

      return await stateMachine.run()
    } finally {
      stateMachine = null
    }
  })
}
