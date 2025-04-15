import { ipcRenderer } from 'electron'

import { HighlightSelector } from 'extension/src/messaging/types'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(selector: HighlightSelector | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
