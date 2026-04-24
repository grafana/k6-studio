import { ipcRenderer } from 'electron'

import { ActionLocator } from '@/schemas/locator'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(selector: ActionLocator | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
