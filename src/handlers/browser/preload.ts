import { ipcRenderer } from 'electron'

import {
  LaunchBrowserOptions,
  BrowserHandler,
  LaunchBrowserError,
} from '@/handlers/browser/types'
import { BrowserEvent } from '@/schemas/recording'

import { createListener } from '../utils'

export function launchBrowser(options: LaunchBrowserOptions) {
  return ipcRenderer.invoke(BrowserHandler.Start, options) as Promise<void>
}

export function stopBrowser() {
  ipcRenderer.send(BrowserHandler.Stop)
}

export function onBrowserClosed(callback: () => void) {
  return createListener(BrowserHandler.Closed, callback)
}

export function onBrowserLaunchError(
  callback: (reason: LaunchBrowserError) => void
) {
  return createListener(BrowserHandler.Error, callback)
}

export function openExternalLink(url: string) {
  return ipcRenderer.invoke(BrowserHandler.OpenExternalLink, url)
}

export function onBrowserEvent(callback: (event: BrowserEvent[]) => void) {
  return createListener(BrowserHandler.BrowserEvent, callback)
}
