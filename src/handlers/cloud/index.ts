import { BrowserWindow, ipcMain, shell } from 'electron'
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

      const result = await stateMachine.run()

      if (result.type === 'started') {
        await shell.openExternal(result.testRunUrl)
      }

      return result
    } finally {
      stateMachine = null
    }
  })
}
