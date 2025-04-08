import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

import { SCRIPTS_PATH, TEMP_GENERATOR_SCRIPT_PATH } from '@/constants/workspace'
import { appSettings } from '@/main'
import { waitForProxy } from '@/proxy'
import { showScriptSelectDialog, runScript, type K6Process } from '@/script'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'

import { ScriptHandler } from './types'

export function initialize() {
  let currentk6Process: K6Process | null

  ipcMain.handle(ScriptHandler.Select, async (event) => {
    console.info(`${ScriptHandler.Select} event received`)
    const browserWindow = browserWindowFromEvent(event)
    const scriptPath = await showScriptSelectDialog(browserWindow)

    return scriptPath
  })

  ipcMain.handle(
    ScriptHandler.Open,
    async (_, scriptPath: string, absolute: boolean = false) => {
      console.log(`${ScriptHandler.Open} event received`)
      const resolvedScriptPath = absolute
        ? scriptPath
        : path.join(SCRIPTS_PATH, scriptPath)

      const script = await readFile(resolvedScriptPath, {
        encoding: 'utf-8',
        flag: 'r',
      })

      return script
    }
  )

  ipcMain.handle(
    ScriptHandler.Run,
    async (event, scriptPath: string, absolute: boolean = false) => {
      console.info(`${ScriptHandler.Run} event received`)
      await waitForProxy()

      const browserWindow = browserWindowFromEvent(event)

      const resolvedScriptPath = absolute
        ? scriptPath
        : path.join(SCRIPTS_PATH, scriptPath)

      currentk6Process = await runScript({
        browserWindow,
        scriptPath: resolvedScriptPath,
        proxyPort: appSettings.proxy.port,
        usageReport: appSettings.telemetry.usageReport,
      })
    }
  )

  ipcMain.on(ScriptHandler.Stop, (event) => {
    console.info(`${ScriptHandler.Stop} event received`)
    if (currentk6Process) {
      currentk6Process.kill()
      currentk6Process = null
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

      currentk6Process = await runScript({
        browserWindow,
        scriptPath: TEMP_GENERATOR_SCRIPT_PATH,
        proxyPort: appSettings.proxy.port,
        usageReport: appSettings.telemetry.usageReport,
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
