import { ipcMain, shell } from 'electron'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { logError } from '@/utils/errors'
import { unlink, writeFile } from '@/utils/fs'
import { basename, extname, isAbsolute, join } from '@/utils/path'
import { validateExternalUrl } from '@/utils/url'

import { RunInCloudStateMachine } from './states'
import { CloudHandlers, RawScript, Script } from './types'

async function createTempFile(script: RawScript) {
  const tempFileName = getTempScriptName()
  const tempFilePath = join(SCRIPTS_PATH, tempFileName)

  await writeFile(tempFilePath, script.content)

  return {
    name: basename(script.name, extname(script.name)),
    path: tempFilePath,
    dispose() {
      try {
        return unlink(tempFilePath)
      } catch {
        return
      }
    },
  }
}

function toScriptFile(script: Script) {
  if (script.type === 'raw') {
    return createTempFile(script)
  }

  return {
    name: basename(script.path),
    path: script.path,
    dispose() {},
  }
}

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
        await shell.openExternal(validateExternalUrl(result.testRunUrl))
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
