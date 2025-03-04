import { BrowserWindow, ipcMain } from 'electron'
import { CloudHandlers } from './types'
import { RunInCloudStateMachine } from './states'

export function initialize(browserWindow: BrowserWindow) {
  let stateMachine: RunInCloudStateMachine | null = null

  ipcMain.handle(CloudHandlers.Run, async (_event, scriptPath: string) => {
    stateMachine = new RunInCloudStateMachine(scriptPath)

    stateMachine.on('state-change', (state) => {
      browserWindow.webContents.send('cloud:state-change', state)
    })

    try {
      return await stateMachine.run()
    } catch (error) {
      console.error(error)
    }
  })
}
