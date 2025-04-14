import { ipcRenderer } from 'electron'

import { AppSettings } from '@/types/settings'

export function getSettings() {
  return ipcRenderer.invoke('settings:get') as Promise<AppSettings>
}

export function saveSettings(settings: AppSettings) {
  return ipcRenderer.invoke('settings:save', settings) as Promise<AppSettings>
}

export function selectBrowserExecutable() {
  return ipcRenderer.invoke(
    'settings:select-browser-executable'
  ) as Promise<Electron.OpenDialogReturnValue>
}

export function selectUpstreamCertificate() {
  return ipcRenderer.invoke(
    'settings:select-upstream-certificate'
  ) as Promise<Electron.OpenDialogReturnValue>
}
