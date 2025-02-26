import { ipcMain } from 'electron'
import { BrowserRemoteHandlers } from './browserRemote.types'
import { BrowserServer } from '@/services/browser/server'
import _ from 'lodash'

export function initialize(browserServer: BrowserServer) {
  ipcMain.on(
    BrowserRemoteHandlers.HighlightElement,
    (_event, selector: string | null) => {
      browserServer.send({
        type: 'highlight-element',
        selector,
      })
    }
  )

  ipcMain.on(BrowserRemoteHandlers.NavigateTo, (_event, url: string) => {
    browserServer.send({
      type: 'navigate-to',
      url,
    })
  })
}
