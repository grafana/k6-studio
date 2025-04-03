import { ipcMain } from 'electron'
import _ from 'lodash'

import { BrowserServer } from '@/services/browser/server'

import { BrowserRemoteHandlers } from './browserRemote.types'

export function initialize(browserServer: BrowserServer) {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, selector: string | null) => {
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
