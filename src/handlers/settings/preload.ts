import { ipcRenderer } from 'electron'

import { AppSettings } from '@/types/settings'

import { SettingsHandler } from './types'

export function getSettings() {
  return ipcRenderer.invoke(SettingsHandler.Get) as Promise<AppSettings>
}

export function getFallbackWarning() {
  return ipcRenderer.invoke(SettingsHandler.GetFallbackWarning) as Promise<
    string | null
  >
}

export function saveSettings(settings: AppSettings) {
  return ipcRenderer.invoke(
    SettingsHandler.Save,
    settings
  ) as Promise<AppSettings>
}

export function selectBrowserExecutable() {
  return ipcRenderer.invoke(
    SettingsHandler.SelectBrowserExecutable
  ) as Promise<Electron.OpenDialogReturnValue>
}

export function selectUpstreamCertificate() {
  return ipcRenderer.invoke(
    SettingsHandler.SelectUpstreamCertificate
  ) as Promise<Electron.OpenDialogReturnValue>
}

export function isEncryptionAvailable() {
  return ipcRenderer.invoke(
    SettingsHandler.IsEncryptionAvailable
  ) as Promise<boolean>
}
