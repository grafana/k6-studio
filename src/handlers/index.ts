import { BrowserServer } from '@/services/browser/server'

import * as app from './app'
import * as auth from './auth'
import * as browser from './browser'
import * as cloud from './cloud'
import * as dataFiles from './dataFiles'
import * as generator from './generator'
import * as har from './har'
import * as log from './log'
import * as proxy from './proxy'
import * as script from './script'
import * as settings from './settings'
import * as ui from './ui'

interface Services {
  browserServer: BrowserServer
}

export function initialize({ browserServer }: Services) {
  auth.initialize()
  cloud.initialize()
  har.initialize()
  browser.initialize(browserServer)
  script.initialize()
  settings.initialize()
  proxy.initialize()
  ui.initialize()
  generator.initialize()
  dataFiles.initialize()
  log.initialize()
  app.initialize()
}
