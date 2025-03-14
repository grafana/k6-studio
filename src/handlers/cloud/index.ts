import { BrowserWindow, ipcMain, shell } from 'electron'
import { CloudHandlers, RawScript, Script } from './types'
import { RunInCloudStateMachine } from './states'
import { basename, extname, isAbsolute, join } from 'path'
import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/script'
import { rm, writeFile } from 'fs/promises'
import { logError } from '@/utils/errors'

async function createTempFile(script: RawScript) {
  const tempFileName = getTempScriptName()
  const tempFilePath = join(SCRIPTS_PATH, tempFileName)

  await writeFile(tempFilePath, script.content)

  return {
    name: basename(script.name, extname(script.name)),
    path: tempFilePath,
    dispose() {
      try {
        return rm(tempFilePath)
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

export function initialize(browserWindow: BrowserWindow) {
  let stateMachine: RunInCloudStateMachine | null = null

  ipcMain.handle(CloudHandlers.Run, async (_event, script: Script) => {
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
