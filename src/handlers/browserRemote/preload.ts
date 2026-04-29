import { ipcRenderer } from 'electron'

import { ElementLocator } from '@/schemas/locator'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(locator: ElementLocator | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, locator)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
