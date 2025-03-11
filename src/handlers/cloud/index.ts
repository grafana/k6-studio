import { BrowserWindow, ipcMain, shell } from 'electron'
import { CloudHandlers, Script } from './types'
import { RunInCloudStateMachine } from './states'
import { isAbsolute, join } from 'path'
import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/script'
import { rm, writeFile } from 'fs/promises'

async function createTempFile(content: string) {
  const tempFileName = getTempScriptName()
  const tempFilePath = join(SCRIPTS_PATH, tempFileName)

  await writeFile(tempFilePath, content)

  return {
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
    return createTempFile(script.content)
  }

  return {
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

      stateMachine = new RunInCloudStateMachine(absolutePath)

      stateMachine.on('state-change', (state) => {
        browserWindow.webContents.send('cloud:state-change', state)
      })

      const result = await stateMachine.run()

      if (result.type === 'started') {
        await shell.openExternal(result.testRunUrl)
      }

      return result
    } finally {
      await file.dispose()

      stateMachine = null
    }
  })
}
