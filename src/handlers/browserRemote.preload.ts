import { ipcRenderer } from 'electron'
import { BrowserRemoteHandlers } from './browserRemote.types'

export function highlightElement(selector: string | null) {
  ipcRenderer.send(BrowserRemoteHandlers.HighlightElement, selector)
}

export function navigateTo(url: string) {
  ipcRenderer.send(BrowserRemoteHandlers.NavigateTo, url)
}
