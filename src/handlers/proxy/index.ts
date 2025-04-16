import { ipcMain } from 'electron'

import { launchProxyAndAttachEmitter, stopProxyProcess } from '@/proxy'
import { browserWindowFromEvent } from '@/utils/electron'

export function initialize() {
  ipcMain.handle('proxy:start', async (event) => {
    console.info('proxy:start event received')

    const browserWindow = browserWindowFromEvent(event)
    k6StudioState.currentProxyProcess =
      await launchProxyAndAttachEmitter(browserWindow)
  })

  ipcMain.on('proxy:stop', () => {
    console.info('proxy:stop event received')
    k6StudioState.wasProxyStoppedByClient = true
    return stopProxyProcess()
  })

  ipcMain.handle('proxy:status:get', () => {
    console.info('proxy:status:get event received')
    return k6StudioState.proxyStatus
  })
}
