import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { isEncryptionAvailable } from '@/main/encryption'
import {
  applySettings,
  getSettings,
  saveSettings,
  selectBrowserExecutable,
  selectUpstreamCertificate,
} from '@/main/settings'
import { AppSettings } from '@/types/settings'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'

import { SettingsHandler } from './types'

export function initialize() {
  ipcMain.handle(SettingsHandler.Get, async () => {
    console.info(`${SettingsHandler.Get} event received`)
    return await getSettings()
  })

  ipcMain.handle(SettingsHandler.Save, async (event, data: AppSettings) => {
    console.info(`${SettingsHandler.Save} event received`)

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

  ipcMain.handle(SettingsHandler.SelectBrowserExecutable, async () => {
    console.info(`${SettingsHandler.SelectBrowserExecutable} event received`)
    return selectBrowserExecutable()
  })

  ipcMain.handle(SettingsHandler.SelectUpstreamCertificate, async () => {
    console.info(`${SettingsHandler.SelectUpstreamCertificate} event received`)
    return selectUpstreamCertificate()
  })

  ipcMain.handle(SettingsHandler.IsEncryptionAvailable, () => {
    return isEncryptionAvailable()
  })
}
