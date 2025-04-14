// TODO: https://github.com/grafana/k6-studio/issues/277
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, contextBridge } from 'electron'

import * as auth from './handlers/auth/preload'
import * as browser from './handlers/browser/preload'
import * as cloud from './handlers/cloud/preload'
import * as har from './handlers/har/preload'
import * as script from './handlers/script/preload'
import * as settings from './handlers/settings/preload'
import { createListener } from './handlers/utils'
import * as Sentry from './sentry'
import { ProxyData, ProxyStatus, StudioFile } from './types'
import { GeneratorFileData } from './types/generator'
import { DataFilePreview } from './types/testData'
import { AddToastPayload } from './types/toast'

interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  dataFiles: StudioFile[]
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

const data = {
  importFile: (): Promise<string | undefined> => {
    return ipcRenderer.invoke('data-file:import')
  },
  loadPreview: (filePath: string): Promise<DataFilePreview> => {
    return ipcRenderer.invoke('data-file:load-preview', filePath)
  },
} as const

const ui = {
  toggleTheme: () => {
    ipcRenderer.send('ui:toggle-theme')
  },
  detectBrowser: (): Promise<boolean> => {
    return ipcRenderer.invoke('ui:detect-browser')
  },
  openContainingFolder: (file: StudioFile) => {
    ipcRenderer.send('ui:open-folder', file)
  },
  openFileInDefaultApp: (file: StudioFile): Promise<string> => {
    return ipcRenderer.invoke('ui:open-file-in-default-app', file)
  },
  deleteFile: (file: StudioFile): Promise<void> => {
    return ipcRenderer.invoke('ui:delete-file', file)
  },
  getFiles: (): Promise<GetFilesResponse> => ipcRenderer.invoke('ui:get-files'),
  renameFile: (
    oldFileName: string,
    newFileName: string,
    type: StudioFile['type']
  ): Promise<void> => {
    return ipcRenderer.invoke('ui:rename-file', oldFileName, newFileName, type)
  },
  reportIssue: (): Promise<void> => ipcRenderer.invoke('ui:report-issue'),
  onAddFile: (callback: (file: StudioFile) => void) => {
    return createListener('ui:add-file', callback)
  },
  onRemoveFile: (callback: (file: StudioFile) => void) => {
    return createListener('ui:remove-file', callback)
  },
  onToast: (callback: (toast: AddToastPayload) => void) => {
    return createListener('ui:toast', callback)
  },
} as const

const generator = {
  createGenerator: (recordingPath: string): Promise<string> => {
    return ipcRenderer.invoke('generator:create', recordingPath)
  },
  saveGenerator: (
    generator: GeneratorFileData,
    fileName: string
  ): Promise<void> => {
    return ipcRenderer.invoke('generator:save', generator, fileName)
  },
  loadGenerator: (fileName: string): Promise<GeneratorFileData> => {
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

const studio = {
  auth,
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
  cloud,
} as const

contextBridge.exposeInMainWorld('studio', studio)

Sentry.configureRendererProcess(studio.settings.getSettings)

export type Studio = typeof studio
