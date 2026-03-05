import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { FileLocation } from '@/handlers/file/types'
import { resolveFileLocation } from '@/handlers/file/utils'
import { waitForProxy } from '@/main/proxy'
import { showScriptSelectDialog, runScript } from '@/main/script'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import {
  browserWindowFromEvent,
  workspaceWindowFromEvent,
} from '@/utils/electron'
import { toScriptFile } from '@/utils/fs/scripts'
import { K6Client } from '@/utils/k6/client'
import { TestRun } from '@/utils/k6/testRun'

import { Script } from '../cloud/types'

import { ScriptHandler } from './types'

export function initialize() {
  let currentTestRun: TestRun | null

  ipcMain.handle(ScriptHandler.Analyze, async (_, location: FileLocation) => {
    console.info(`${ScriptHandler.Analyze} event received`)
    const scriptPath = resolveFileLocation('script', location)
    const options = await new K6Client()
      .inspect({ scriptPath })
      .catch(() => ({}))
    return options ?? {}
  })

  ipcMain.handle(
    ScriptHandler.ShowSaveDialog,
    (_, fileName: string): string => {
      console.info(`${ScriptHandler.ShowSaveDialog} event received`)
      return resolveFileLocation('script', { type: 'legacy', name: fileName })
    }
  )

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

  ipcMain.handle(
    ScriptHandler.Run,
    async (event, script: Script, shouldTrack = true) => {
      console.info(`${ScriptHandler.Run} event received`)
      await waitForProxy()

      const file = await toScriptFile(script)

      const browserWindow = workspaceWindowFromEvent(event)

      currentTestRun = await runScript({
        browserWindow,
        scriptPath: file.path,
        proxySettings: k6StudioState.appSettings.proxy,
        usageReport: k6StudioState.appSettings.telemetry.usageReport,
      })

      currentTestRun.on('stop', async () => {
        await file.dispose()
      })

      if (shouldTrack) {
        trackEvent({
          event: UsageEventName.ScriptValidated,
          payload: {
            isExternal: !browserWindow.workspace.isInside(file.path),
          },
        })
      }
    }
  )

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
}
