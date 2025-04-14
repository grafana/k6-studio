import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { applySettings } from '@/main'
import {
  getSettings,
  saveSettings,
  selectBrowserExecutable,
  selectUpstreamCertificate,
} from '@/settings'
import { AppSettings } from '@/types/settings'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'

export function initialize() {
  ipcMain.handle('settings:get', async () => {
    console.info('settings:get event received')
    return await getSettings()
  })

  ipcMain.handle('settings:save', async (event, data: AppSettings) => {
    console.info('settings:save event received')

    const browserWindow = browserWindowFromEvent(event)
    try {
      // don't pass fields that are not submitted by the form
      const { windowState: _, ...settings } = data
      const modifiedSettings = await saveSettings(settings)
      await applySettings(modifiedSettings, browserWindow)

      sendToast(browserWindow.webContents, {
        title: 'Settings saved successfully',
        status: 'success',
      })
      return true
    } catch (error) {
      log.error(error)
      sendToast(browserWindow.webContents, {
        title: 'Failed to save settings',
        status: 'error',
      })
      return false
    }
  })

  ipcMain.handle('settings:select-browser-executable', async () => {
    return selectBrowserExecutable()
  })

  ipcMain.handle('settings:select-upstream-certificate', async () => {
    return selectUpstreamCertificate()
  })
}
