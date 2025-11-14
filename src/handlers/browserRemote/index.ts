import { ipcMain } from 'electron'

import { HighlightSelector } from 'extension/src/messaging/types'

import { BrowserRemoteHandlers } from './types'

export function initialize() {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, selector: HighlightSelector | null) => {
      k6StudioState.currentRecordingSession?.highlightElement(selector)
    }
  )

  ipcMain.on(BrowserRemoteHandlers.NavigateTo, (_event, url: string) => {
    k6StudioState.currentRecordingSession?.navigateTo(url)
  })
}
