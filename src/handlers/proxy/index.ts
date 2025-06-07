import { ipcMain } from 'electron'

import { checkProxyHealth } from '@/main/healthCheck'
import { launchProxyAndAttachEmitter, stopProxyProcess } from '@/main/proxy'
import { browserWindowFromEvent } from '@/utils/electron'

import { ProxyHandler } from './types'

export function initialize() {
  ipcMain.handle(ProxyHandler.Start, async (event) => {
    console.info(`${ProxyHandler.Start} event received`)

    const browserWindow = browserWindowFromEvent(event)
    k6StudioState.currentProxyProcess =
      await launchProxyAndAttachEmitter(browserWindow)
  })

  ipcMain.on(ProxyHandler.Stop, () => {
    console.info(`${ProxyHandler.Stop} event received`)
    k6StudioState.wasProxyStoppedByClient = true
    return stopProxyProcess()
  })

  ipcMain.handle(ProxyHandler.GetStatus, () => {
    console.info(`${ProxyHandler.GetStatus} event received`)
    return k6StudioState.proxyStatus
  })

  ipcMain.handle(ProxyHandler.CheckHealth, async () => {
    console.info(`${ProxyHandler.CheckHealth} event received`)
    const isHealthy = await checkProxyHealth()
    return isHealthy
  })
}
