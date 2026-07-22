import { ipcRenderer } from 'electron'

import { ElementLocator, LocatorOptions } from '@/schemas/locator'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(
  locator: ElementLocator | null,
  frames?: LocatorOptions[]
) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, locator, frames)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
