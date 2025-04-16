import { ipcRenderer } from 'electron'

import { ProxyData, ProxyStatus } from '@/types'

import { createListener } from '../utils'

export function launchProxy() {
  return ipcRenderer.invoke('proxy:start') as Promise<void>
}

export function stopProxy() {
  ipcRenderer.send('proxy:stop')
}

export function onProxyData(callback: (data: ProxyData) => void) {
  return createListener('proxy:data', callback)
}

export function getProxyStatus() {
  return ipcRenderer.invoke('proxy:status:get') as Promise<ProxyStatus>
}

export function onProxyStatusChange(callback: (status: ProxyStatus) => void) {
  return createListener('proxy:status:change', callback)
}
