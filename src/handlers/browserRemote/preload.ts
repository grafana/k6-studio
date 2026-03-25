import { ipcRenderer } from 'electron'

import { NodeSelector } from '@/schemas/selectors'

import { BrowserRemoteHandlers } from './types'

export function highlightElement(selector: NodeSelector | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
