// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge } from 'electron'
import { ProxyData, K6Log } from './types'

const proxy = {
  launchProxy: () => {
    ipcRenderer.send('proxy:start')
  },
  onProxyStarted: (callback: () => void) => {
    ipcRenderer.on('proxy:started', () => {
      callback()
    })
  },
  stopProxy: () => {
    ipcRenderer.send('proxy:stop')
  },
  onProxyData: (callback: (data: ProxyData) => void) => {
    ipcRenderer.on('proxy:data', (_, data) => {
      callback(data)
    })
  },
} as const

const browser = {
  launchBrowser: () => {
    ipcRenderer.send('browser:start')
  },
  onBrowserStarted: (callback: () => void) => {
    ipcRenderer.on('browser:started', () => {
      callback()
    })
  },
  stopBrowser: () => {
    ipcRenderer.send('browser:stop')
  },
} as const

const script = {
  showScriptSelectDialog: async () => {
    return await ipcRenderer.invoke('script:select')
  },
  runScript: (scriptPath: string) => {
    ipcRenderer.send('script:run', scriptPath)
  },
  stopScript: () => {
    ipcRenderer.send('script:stop')
  },
  onScriptLog: (callback: (data: K6Log) => void) => {
    ipcRenderer.on('script:log', (_, data) => {
      callback(data)
    })
  },
  onScriptStopped: (callback: () => void) => {
    ipcRenderer.on('script:stopped', () => {
      callback()
    })
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
