import { ipcMain } from 'electron'
import _ from 'lodash'

import { BrowserServer } from '@/services/browser/server'
import { HighlightSelector } from 'extension/src/messaging/types'

import { BrowserRemoteHandlers } from './types'

export function initialize(browserServer: BrowserServer) {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, selector: HighlightSelector | null) => {
      browserServer.send({
        type: 'highlight-elements',
        selector,
      })
    }
  )

  ipcMain.on(BrowserRemoteHandlers.NavigateTo, (_event, url: string) => {
    browserServer.send({
      type: 'navigate',
      url,
    })
  })
}
