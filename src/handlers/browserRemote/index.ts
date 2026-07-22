import { ipcMain } from 'electron'

import { ElementLocator, LocatorOptions } from '@/schemas/locator'

import { BrowserRemoteHandlers } from './types'

export function initialize() {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, locator: ElementLocator | null, frames?: LocatorOptions[]) => {
      k6StudioState.currentRecordingSession?.highlightElement(locator, frames)
    }
  )

  ipcMain.on(BrowserRemoteHandlers.NavigateTo, (_event, url: string) => {
    k6StudioState.currentRecordingSession?.navigateTo(url)
  })
}
