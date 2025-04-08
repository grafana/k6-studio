import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'

import { SCRIPTS_PATH, TEMP_GENERATOR_SCRIPT_PATH } from '@/constants/workspace'
import { appSettings } from '@/main'
import { waitForProxy } from '@/proxy'
import { showScriptSelectDialog, runScript, type K6Process } from '@/script'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'

export function initialize() {
  let currentk6Process: K6Process | null

  ipcMain.handle('script:select', async (event) => {
    console.info('script:select event received')
    const browserWindow = browserWindowFromEvent(event)
    const scriptPath = await showScriptSelectDialog(browserWindow)

    return scriptPath
  })

  ipcMain.handle(
    'script:open',
    async (_, scriptPath: string, absolute: boolean = false) => {
      console.log('script:open event received')
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
    'script:run',
    async (event, scriptPath: string, absolute: boolean = false) => {
      console.info('script:run event received')
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

  ipcMain.on('script:stop', (event) => {
    console.info('script:stop event received')
    if (currentk6Process) {
      currentk6Process.kill()
      currentk6Process = null
    }

    const browserWindow = browserWindowFromEvent(event)
    browserWindow.webContents.send('script:stopped')
  })

  ipcMain.handle('script:run-from-generator', async (event, script: string) => {
    console.log('script:run-from-generator event received')
    await writeFile(TEMP_GENERATOR_SCRIPT_PATH, script)

    const browserWindow = browserWindowFromEvent(event)

    currentk6Process = await runScript({
      browserWindow,
      scriptPath: TEMP_GENERATOR_SCRIPT_PATH,
      proxyPort: appSettings.proxy.port,
      usageReport: appSettings.telemetry.usageReport,
    })

    await unlink(TEMP_GENERATOR_SCRIPT_PATH)
  })

  ipcMain.handle(
    'script:save',
    async (event, script: string, fileName: string = 'script.js') => {
      console.log('script:save event received')
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
