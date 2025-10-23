import { contextBridge } from 'electron'

import * as ai from './handlers/ai/preload'
import * as app from './handlers/app/preload'
import * as auth from './handlers/auth/preload'
import * as browser from './handlers/browser/preload'
import * as browserRemote from './handlers/browserRemote/preload'
import * as cloud from './handlers/cloud/preload'
import * as data from './handlers/dataFiles/preload'
import * as generator from './handlers/generator/preload'
import * as har from './handlers/har/preload'
import * as log from './handlers/log/preload'
import * as proxy from './handlers/proxy/preload'
import * as script from './handlers/script/preload'
import * as settings from './handlers/settings/preload'
import * as ui from './handlers/ui/preload'
import * as Sentry from './sentry'

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
  ai,
} as const

contextBridge.exposeInMainWorld('studio', studio)

Sentry.configureRendererProcess(studio.settings.getSettings)

export type Studio = typeof studio
