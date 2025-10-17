import { ipcRenderer } from 'electron'

import {
  LaunchBrowserOptions,
  BrowserHandler,
  LaunchBrowserError,
} from '@/handlers/browser/types'
import { BrowserEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/frontend/view/types'

import { createListener } from '../utils'

export function launchBrowser(options: LaunchBrowserOptions) {
  return ipcRenderer.invoke(BrowserHandler.Start, options) as Promise<void>
}

export function highlightElement(selector: HighlightSelector | null) {
  ipcRenderer.send(BrowserHandler.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserHandler.NavigateTo, url)
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

// TODO: We should move this to e.g. app because all the other handlers are related
// to recording and this is more general.
export function openExternalLink(url: string) {
  return ipcRenderer.invoke(BrowserHandler.OpenExternalLink, url)
}

export function onBrowserEvent(callback: (event: BrowserEvent[]) => void) {
  return createListener(BrowserHandler.BrowserEvent, callback)
}
