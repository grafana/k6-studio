import { ipcRenderer } from 'electron'

import { ProxyData, ProxyStatus } from '@/types'

import { createListener } from '../utils'

import { ProxyHandler } from './types'

export function launchProxy() {
  return ipcRenderer.invoke(ProxyHandler.Start) as Promise<void>
}

export function stopProxy() {
  ipcRenderer.send(ProxyHandler.Stop)
}

export function onProxyData(callback: (data: ProxyData) => void) {
  return createListener(ProxyHandler.Data, callback)
}

export function getProxyStatus() {
  return ipcRenderer.invoke(ProxyHandler.GetStatus) as Promise<ProxyStatus>
}

export function onProxyStatusChange(callback: (status: ProxyStatus) => void) {
  return createListener(ProxyHandler.ChangeStatus, callback)
}

export function checkProxyHealth() {
  return ipcRenderer.invoke(ProxyHandler.CheckHealth) as Promise<boolean>
}
