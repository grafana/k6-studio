import { ipcRenderer } from 'electron'

import { BrowserEvent } from '@/schemas/recording'

import { createListener } from '../utils'

import { BrowserHandler } from './types'

export function launchBrowser(url?: string) {
  return ipcRenderer.invoke(BrowserHandler.Start, url) as Promise<void>
}

export function stopBrowser() {
  ipcRenderer.send(BrowserHandler.Stop)
}

export function onBrowserClosed(callback: () => void) {
  return createListener(BrowserHandler.Closed, callback)
}

export function onBrowserLaunchFailed(callback: () => void) {
  return createListener(BrowserHandler.Failed, callback)
}

export function openExternalLink(url: string) {
  return ipcRenderer.invoke(BrowserHandler.OpenExternalLink, url)
}

export function onBrowserEvent(callback: (event: BrowserEvent[]) => void) {
  return createListener(BrowserHandler.BrowserEvent, callback)
}
