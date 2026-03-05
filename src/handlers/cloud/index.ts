import { ipcMain, shell } from 'electron'
import { isAbsolute, join } from 'path'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { logError } from '@/utils/errors'
import { toScriptFile } from '@/utils/fs/scripts'

import { RunInCloudStateMachine } from './states'
import { CloudHandlers, Script } from './types'

export function initialize() {
  let stateMachine: RunInCloudStateMachine | null = null

  ipcMain.handle(CloudHandlers.Run, async (event, script: Script) => {
    const browserWindow = browserWindowFromEvent(event)
    const file = await toScriptFile(script)

    const absolutePath = !isAbsolute(file.path)
      ? join(SCRIPTS_PATH, file.path)
      : file.path

    try {
      if (stateMachine !== null) {
        stateMachine.abort()
      }

      stateMachine = new RunInCloudStateMachine(absolutePath, file.name)

      stateMachine.on('state-change', (state) => {
        browserWindow.webContents.send('cloud:state-change', state)
      })

      const result = await stateMachine.run()

      if (result.type === 'started') {
        trackEvent({
          event: UsageEventName.ScriptRunInCloud,
        })
        await shell.openExternal(result.testRunUrl)
      }

      return result
    } catch (error) {
      logError(error)

      throw error
    } finally {
      await file.dispose()

      stateMachine = null
    }
  })
}
