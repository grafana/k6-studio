// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge } from 'electron'
import { ProxyData } from './lib/types'

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
} as const

const studio = {
  proxy: proxy,
  browser: browser,
  script: script,
} as const

contextBridge.exposeInMainWorld('studio', studio)

export type Studio = typeof studio
