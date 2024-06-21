// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
import { ProxyData, K6Log, GroupedProxyData } from './types'
import { TestRule } from './types/rules'

// Create listener and return clean up function to be used in useEffect
function createListener<T>(channel: string, callback: (data: T) => void) {
  const listener = (_: IpcRendererEvent, data: T) => {
    callback(data)
  }

  ipcRenderer.on(channel, listener)

  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

const proxy = {
  launchProxy: () => {
    ipcRenderer.send('proxy:start')
  },
  onProxyStarted: (callback: () => void) => {
    return createListener('proxy:started', callback)
  },
  stopProxy: () => {
    ipcRenderer.send('proxy:stop')
  },
  onProxyData: (callback: (data: ProxyData) => void) => {
    return createListener('proxy:data', callback)
  },
} as const

const browser = {
  launchBrowser: () => {
    ipcRenderer.send('browser:start')
  },
  onBrowserStarted: (callback: () => void) => {
    return createListener('browser:started', callback)
  },
  stopBrowser: () => {
    ipcRenderer.send('browser:stop')
  },
} as const

const script = {
  showScriptSelectDialog: async () => {
    return await ipcRenderer.invoke('script:select')
  },
  generateScript: (
    proxyData: GroupedProxyData,
    rules: TestRule[],
    allowlist: string[]
  ) => {
    ipcRenderer.send('script:generate', proxyData, rules, allowlist)
  },
  runScript: (scriptPath: string) => {
    ipcRenderer.send('script:run', scriptPath)
  },
  stopScript: () => {
    ipcRenderer.send('script:stop')
  },
  onScriptLog: (callback: (data: K6Log) => void) => {
    return createListener('script:log', callback)
  },
  onScriptStopped: (callback: () => void) => {
    return createListener('script:stopped', callback)
  },
} as const

const har = {
  saveFile: (data: string) => {
    ipcRenderer.send('har:save', data)
  },
} as const

const studio = {
  proxy,
  browser,
  script,
  har,
} as const

contextBridge.exposeInMainWorld('studio', studio)

export type Studio = typeof studio
