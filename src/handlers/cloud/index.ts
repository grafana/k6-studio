import { ipcMain, shell } from 'electron'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { getTempScriptName } from '@/main/script'
import { ProjectClient } from '@/services/k6/projects'
import { CloudCredentials } from '@/services/k6/types'
import { VuhClient } from '@/services/k6/vuh'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { logError } from '@/utils/errors'
import { unlink, writeFile } from '@/utils/fs'
import { K6Client } from '@/utils/k6/client'
import { basename, extname, isAbsolute, join } from '@/utils/path'
import { validateExternalUrl } from '@/utils/url'

import { getProfileData } from '../auth/fs'

import { RunInCloudStateMachine } from './states'
import { CloudHandlers, RawScript, Script, VuhEstimate } from './types'

async function getCloudCredentials(): Promise<CloudCredentials | null> {
  const profiles = await getProfileData()
  const stack = profiles.profiles.stacks[profiles.profiles.currentStack]

  if (stack === undefined) {
    return null
  }

  const token = profiles.tokens[stack.id]

  return token === undefined ? null : { stackId: stack.id, token }
}

async function estimateVuh(script: RawScript): Promise<VuhEstimate | null> {
  const credentials = await getCloudCredentials()

  if (credentials === null) {
    return null
  }

  const file = await createTempFile(script)

  try {
    const options = await new K6Client().inspect({ scriptPath: file.path })

    if (options === null) {
      return null
    }

    const project = await new ProjectClient(credentials).findDefault({})
    const result = await new VuhClient(credentials).validateOptions(
      project.id,
      options
    )

    if (result.type === 'limit-exceeded') {
      return { status: 'limit-exceeded', message: result.message }
    }

    return {
      status: 'ok',
      vuhUsage: result.data.vuh_usage,
      baseVuh: result.data.breakdown?.base_total_vuh ?? null,
    }
  } catch (error) {
    logError(error)

    return null
  } finally {
    await file.dispose()
  }
}

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

  ipcMain.handle(CloudHandlers.EstimateVuh, (_event, script: RawScript) =>
    estimateVuh(script)
  )
}
