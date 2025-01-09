// TODO: https://github.com/grafana/k6-studio/issues/277
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
import { ProxyData, K6Log, K6Check, ProxyStatus, StudioFile } from './types'
import { HarFile } from './types/har'
import { GeneratorFile } from './types/generator'
import { AddToastPayload } from './types/toast'
import { AppSettings } from './types/settings'

interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  data: StudioFile[]
}

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
  getProxyStatus: (): Promise<ProxyStatus> => {
    return ipcRenderer.invoke('proxy:status:get')
  },
  onProxyStatusChange: (callback: (status: ProxyStatus) => void) => {
    return createListener('proxy:status:change', callback)
  },
} as const

const browser = {
  launchBrowser: (url?: string): Promise<void> => {
    return ipcRenderer.invoke('browser:start', url)
  },
  stopBrowser: () => {
    ipcRenderer.send('browser:stop')
  },
  onBrowserClosed: (callback: () => void) => {
    return createListener('browser:closed', callback)
  },
  openExternalLink: (url: string) => {
    return ipcRenderer.invoke('browser:open:external:link', url)
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
  saveScriptFromGenerator: (script: string): Promise<void> => {
    return ipcRenderer.invoke('script:save:generator', script)
  },
  saveScript: (script: string, fileName: string): Promise<void> => {
    return ipcRenderer.invoke('script:save', script, fileName)
  },
  runScript: (
    scriptPath: string,
    absolute: boolean = false,
    fromGenerator: boolean = false
  ): Promise<void> => {
    return ipcRenderer.invoke('script:run', scriptPath, absolute, fromGenerator)
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
  onScriptFailed: (callback: () => void) => {
    return createListener('script:failed', callback)
  },
  onScriptCheck: (callback: (data: K6Check[]) => void) => {
    return createListener('script:check', callback)
  },
} as const

const har = {
  saveFile: (data: string, prefix?: string): Promise<string> => {
    return ipcRenderer.invoke('har:save', data, prefix)
  },
  openFile: (filePath: string): Promise<HarFile> => {
    return ipcRenderer.invoke('har:open', filePath)
  },
  importFile: (): Promise<string | undefined> => {
    return ipcRenderer.invoke('har:import')
  },
} as const

const data = {
  importFile: (): Promise<string | undefined> => {
    return ipcRenderer.invoke('data:import')
  },
} as const

const ui = {
  toggleTheme: () => {
    ipcRenderer.send('ui:toggle-theme')
  },
  openContainingFolder: (file: StudioFile) => {
    ipcRenderer.send('ui:open-folder', file)
  },
  deleteFile: (file: StudioFile): Promise<void> => {
    return ipcRenderer.invoke('ui:delete-file', file)
  },
  getFiles: (): Promise<GetFilesResponse> => ipcRenderer.invoke('ui:get-files'),
  onAddFile: (callback: (file: StudioFile) => void) => {
    return createListener('ui:add-file', callback)
  },
  onRemoveFile: (callback: (file: StudioFile) => void) => {
    return createListener('ui:remove-file', callback)
  },
  onToast: (callback: (toast: AddToastPayload) => void) => {
    return createListener('ui:toast', callback)
  },
  renameFile: (
    oldFileName: string,
    newFileName: string,
    type: StudioFile['type']
  ): Promise<string> => {
    return ipcRenderer.invoke('ui:rename-file', oldFileName, newFileName, type)
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

const app = {
  closeSplashscreen: () => {
    ipcRenderer.send('splashscreen:close')
  },
  onApplicationClose: (callback: () => void) => {
    return createListener('app:close', callback)
  },
  closeApplication: () => {
    ipcRenderer.send('app:close')
  },
  changeRoute: (route: string) => {
    return ipcRenderer.send('app:change-route', route)
  },
} as const

const log = {
  openLogFolder: () => {
    ipcRenderer.send('log:open')
  },
  getLogContent: (): Promise<string> => {
    return ipcRenderer.invoke('log:read')
  },
  onLogChange: (callback: (content: string) => void) => {
    return createListener('log:change', callback)
  },
} as const

const settings = {
  getSettings: (): Promise<AppSettings> => {
    return ipcRenderer.invoke('settings:get')
  },
  saveSettings: (settings: AppSettings): Promise<AppSettings> => {
    return ipcRenderer.invoke('settings:save', settings)
  },
  selectBrowserExecutable: (): Promise<Electron.OpenDialogReturnValue> => {
    return ipcRenderer.invoke('settings:select-browser-executable')
  },
  selectUpstreamCertificate: (): Promise<Electron.OpenDialogReturnValue> => {
    return ipcRenderer.invoke('settings:select-upstream-certificate')
  },
}

const studio = {
  proxy,
  browser,
  script,
  data,
  har,
  ui,
  generator,
  app,
  log,
  settings,
} as const

contextBridge.exposeInMainWorld('studio', studio)

export type Studio = typeof studio
