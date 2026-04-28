import { ipcRenderer } from 'electron'

import { ElementLocator } from '@/schemas/locator'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(selector: ElementLocator | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
