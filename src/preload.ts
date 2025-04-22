// TODO: https://github.com/grafana/k6-studio/issues/277
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, contextBridge } from 'electron'

import * as auth from './handlers/auth/preload'
import * as browser from './handlers/browser/preload'
import * as browserRemote from './handlers/browserRemote/preload'
import * as cloud from './handlers/cloud/preload'
import * as data from './handlers/dataFiles/preload'
import * as generator from './handlers/generator/preload'
import * as har from './handlers/har/preload'
import * as proxy from './handlers/proxy/preload'
import * as script from './handlers/script/preload'
import * as settings from './handlers/settings/preload'
import * as ui from './handlers/ui/preload'
import { createListener } from './handlers/utils'
import * as Sentry from './sentry'

const app = {
  platform: process.platform,
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
  browserRemote,
  cloud,
} as const

contextBridge.exposeInMainWorld('studio', studio)

Sentry.configureRendererProcess(studio.settings.getSettings)

export type Studio = typeof studio
