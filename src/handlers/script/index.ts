import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

import { SCRIPTS_PATH, TEMP_GENERATOR_SCRIPT_PATH } from '@/constants/workspace'
import { waitForProxy } from '@/main/proxy'
import { showScriptSelectDialog, runScript } from '@/main/script'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'
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

    const absolute = path.isAbsolute(scriptPath)
    const resolvedScriptPath = absolute
      ? scriptPath
      : path.join(SCRIPTS_PATH, scriptPath)

    const script = await readFile(resolvedScriptPath, {
      encoding: 'utf-8',
      flag: 'r',
    })

    return {
      script,
      isExternal: isExternalScript(resolvedScriptPath),
    }
  })

  ipcMain.handle(ScriptHandler.Run, async (event, scriptPath: string) => {
    console.info(`${ScriptHandler.Run} event received`)
    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)

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
  })

  ipcMain.on(ScriptHandler.Stop, (event) => {
    console.info(`${ScriptHandler.Stop} event received`)
    if (currentTestRun) {
      currentTestRun.stop().catch((error) => {
        log.error('Failed to stop the test run', error)
      })

      currentTestRun = null
    }

    const browserWindow = browserWindowFromEvent(event)
    browserWindow.webContents.send(ScriptHandler.Stopped)
  })

  ipcMain.handle(
    ScriptHandler.RunFromGenerator,
    async (event, script: string) => {
      console.info(`${ScriptHandler.RunFromGenerator} event received`)
      await writeFile(TEMP_GENERATOR_SCRIPT_PATH, script)

      const browserWindow = browserWindowFromEvent(event)

      currentTestRun = await runScript({
        browserWindow,
        scriptPath: TEMP_GENERATOR_SCRIPT_PATH,
        proxySettings: k6StudioState.appSettings.proxy,
        usageReport: k6StudioState.appSettings.telemetry.usageReport,
      })

      trackEvent({
        event: UsageEventName.ScriptValidated,
        payload: {
          isExternal: false,
        },
      })

      await unlink(TEMP_GENERATOR_SCRIPT_PATH)
    }
  )

  ipcMain.handle(
    ScriptHandler.Save,
    async (event, script: string, fileName: string = 'script.js') => {
      console.info(`${ScriptHandler.Save} event received`)
      const browserWindow = browserWindowFromEvent(event)
      try {
        const filePath = path.join(SCRIPTS_PATH, fileName)
        await writeFile(filePath, script)

        trackEvent({
          event: UsageEventName.ScriptExported,
        })
        sendToast(browserWindow.webContents, {
          title: 'Script exported successfully',
          status: 'success',
        })
      } catch (error) {
        sendToast(browserWindow.webContents, {
          title: 'Failed to export the script',
          status: 'error',
        })
        log.error(error)
      }
    }
  )
}
