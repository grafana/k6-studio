import { ipcMain } from 'electron'

import { ActionLocator } from '@/main/runner/schema'

import { BrowserRemoteHandlers } from './types'

export function initialize() {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, selector: ActionLocator | null) => {
      k6StudioState.currentRecordingSession?.highlightElement(selector)
    }
  )

  ipcMain.on(BrowserRemoteHandlers.NavigateTo, (_event, url: string) => {
    k6StudioState.currentRecordingSession?.navigateTo(url)
  })
}
