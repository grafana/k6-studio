import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
import { ProxyData, K6Log, FolderContent } from './types'
import { HarFile } from './types/har'
import { GeneratorFile } from './types/generator'
import { AddToastPayload } from './types/toast'

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
  onBrowserClosed: (callback: () => void) => {
    return createListener('browser:closed', callback)
  },
} as const

const script = {
  showScriptSelectDialog: (): Promise<{
    path: string
    content: string
  } | void> => {
    return ipcRenderer.invoke('script:select')
  },
  openScript: (
    filePath: string
  ): Promise<{
    path: string
    content: string
  }> => {
    return ipcRenderer.invoke('script:open', filePath)
  },
  saveScript: (script: string) => {
    ipcRenderer.send('script:save', script)
  },
  runScript: (scriptPath: string, absolute = false): Promise<void> => {
    return ipcRenderer.invoke('script:run', scriptPath, absolute)
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
  onScriptFinished: (callback: () => void) => {
    return createListener('script:finished', callback)
  },
} as const

const har = {
  saveFile: (data: string): Promise<string> => {
    return ipcRenderer.invoke('har:save', data)
  },
  openFile: (filePath: string): Promise<HarFile> => {
    return ipcRenderer.invoke('har:open', filePath)
  },
  importFile: (): Promise<string | undefined> => {
    return ipcRenderer.invoke('har:import')
  },
} as const

const ui = {
  toggleTheme: () => {
    ipcRenderer.send('ui:toggle-theme')
  },
  openContainingFolder: (fileName: string) => {
    ipcRenderer.send('ui:open-folder', fileName)
  },
  deleteFile: (fileName: string): Promise<void> => {
    return ipcRenderer.invoke('ui:delete-file', fileName)
  },
  getFiles: (): Promise<FolderContent> => ipcRenderer.invoke('ui:get-files'),
  onAddFile: (callback: (fileName: string) => void) => {
    return createListener('ui:add-file', callback)
  },
  onRemoveFile: (callback: (fileName: string) => void) => {
    return createListener('ui:remove-file', callback)
  },
  onToast: (callback: (toast: AddToastPayload) => void) => {
    return createListener('ui:toast', callback)
  },
} as const

const generator = {
  saveGenerator: (generatorFile: string, fileName: string): Promise<string> => {
    return ipcRenderer.invoke('generator:save', generatorFile, fileName)
  },
  loadGenerator: (fileName: string): Promise<GeneratorFile> => {
    return ipcRenderer.invoke('generator:open', fileName)
  },
} as const

const studio = {
  proxy,
  browser,
  script,
  har,
  ui,
  generator,
} as const

contextBridge.exposeInMainWorld('studio', studio)

export type Studio = typeof studio
