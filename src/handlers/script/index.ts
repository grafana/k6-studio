import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

import { SCRIPTS_PATH } from '@/constants/workspace'
import { waitForProxy } from '@/main/proxy'
import { showScriptSelectDialog, runScript } from '@/main/script'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { ArchiveError, K6Client } from '@/utils/k6/client'
import { TestRun } from '@/utils/k6/testRun'
import { isExternalScript } from '@/utils/workspace'

import { ScriptHandler } from './types'

export function initialize() {
  let currentTestRun: TestRun | null

  ipcMain.handle(ScriptHandler.Select, async (event) => {
    console.info(`${ScriptHandler.Select} event received`)
    const browserWindow = browserWindowFromEvent(event)
    const scriptPath = await showScriptSelectDialog(browserWindow)

    if (scriptPath) {
      trackEvent({
        event: UsageEventName.ScriptOpenedExternal,
      })
    }

    return scriptPath
  })

  ipcMain.handle(ScriptHandler.Open, async (_, scriptPath: string) => {
    console.log(`${ScriptHandler.Open} event received`)

    const script = await readFile(scriptPath, {
      encoding: 'utf-8',
      flag: 'r',
    })

    const options = await new K6Client()
      .inspect({ scriptPath })
      .catch(() => ({}))

    return {
      script,
      options: options ?? {},
      isExternal: isExternalScript(scriptPath),
    }
  })

  ipcMain.handle(ScriptHandler.Run, async (event, scriptPath: string) => {
    console.info(`${ScriptHandler.Run} event received`)

    const browserWindow = browserWindowFromEvent(event)

    try {
      await waitForProxy()

      const absolute = path.isAbsolute(scriptPath)
      const resolvedScriptPath = absolute
        ? scriptPath
        : path.join(SCRIPTS_PATH, scriptPath)

      currentTestRun = await runScript({
        browserWindow,
        scriptPath: resolvedScriptPath,
        proxySettings: k6StudioState.appSettings.proxy,
        usageReport: k6StudioState.appSettings.telemetry.usageReport,
      })

      trackEvent({
        event: UsageEventName.ScriptValidated,
        payload: {
          isExternal: isExternalScript(resolvedScriptPath),
        },
      })
    } catch (error) {
      browserWindow.webContents.send(ScriptHandler.Failed)

      if (error instanceof ArchiveError) {
        for (const logEntry of error.stderr) {
          browserWindow.webContents.send(ScriptHandler.Log, logEntry)
        }
      }

      throw error
    }
  })

  ipcMain.on(ScriptHandler.Stop, () => {
    console.info(`${ScriptHandler.Stop} event received`)
    if (currentTestRun) {
      currentTestRun.stop().catch((error) => {
        log.error('Failed to stop the test run', error)
      })

      currentTestRun = null
    }
  })

  ipcMain.handle(
    ScriptHandler.RunFromGenerator,
    async (event, script: string, scriptPath: string, shouldTrack = true) => {
      console.info(`${ScriptHandler.RunFromGenerator} event received`)

      const browserWindow = browserWindowFromEvent(event)

      try {
        await writeFile(scriptPath, script)

        currentTestRun = await runScript({
          browserWindow,
          scriptPath,
          proxySettings: k6StudioState.appSettings.proxy,
          usageReport: k6StudioState.appSettings.telemetry.usageReport,
        })

        if (shouldTrack) {
          trackEvent({
            event: UsageEventName.ScriptValidated,
            payload: {
              isExternal: false,
            },
          })
        }
      } catch (error) {
        browserWindow.webContents.send(ScriptHandler.Failed)

        if (error instanceof ArchiveError) {
          for (const logEntry of error.stderr) {
            browserWindow.webContents.send(ScriptHandler.Log, logEntry)
          }
        }

        throw error
      } finally {
        await unlink(scriptPath).catch(() => {
          // Best case effort cleanup.
        })
      }
    }
  )

  ipcMain.handle(
    ScriptHandler.Save,
    async (_, scriptPath: string, script: string) => {
      console.info(`${ScriptHandler.Save} event received`)
      try {
        await writeFile(scriptPath, script)

        trackEvent({
          event: UsageEventName.ScriptExported,
          payload: {
            isExternal: !scriptPath.startsWith(SCRIPTS_PATH),
          },
        })

        return scriptPath
      } catch (error) {
        log.error(error)

        throw error
      }
    }
  )
}
