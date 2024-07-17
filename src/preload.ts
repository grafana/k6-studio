// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
import { ProxyData, K6Log } from './types'
import { HarFile } from './types/har'

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
  launchProxy: (): Promise<void> => {
    return ipcRenderer.invoke('proxy:start')
  },
  stopProxy: () => {
    ipcRenderer.send('proxy:stop')
  },
  onProxyData: (callback: (data: ProxyData) => void) => {
    return createListener('proxy:data', callback)
  },
} as const

const browser = {
  launchBrowser: (): Promise<void> => {
    return ipcRenderer.invoke('browser:start')
  },
  stopBrowser: () => {
    ipcRenderer.send('browser:stop')
  },
} as const

const script = {
  showScriptSelectDialog: () => {
    return ipcRenderer.invoke('script:select')
  },
  saveScript: (script: string) => {
    ipcRenderer.send('script:save', script)
  },
  runScript: (scriptPath: string): Promise<void> => {
    return ipcRenderer.invoke('script:run', scriptPath)
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
  openFile: (): Promise<HarFile | void> => {
    return ipcRenderer.invoke('har:open')
  },
} as const

const settings = {
  toggleTheme: () => {
    ipcRenderer.send('settings:toggle-theme')
  },
}

const generator = {
  saveGenerator: (generatorFile: string) => {
    ipcRenderer.send('generator:save', generatorFile)
  },
} as const

const studio = {
  proxy,
  browser,
  script,
  har,
  settings,
  generator,
} as const

contextBridge.exposeInMainWorld('studio', studio)

export type Studio = typeof studio
