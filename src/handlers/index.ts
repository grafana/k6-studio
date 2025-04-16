import { BrowserServer } from '@/services/browser/server'

import * as auth from './auth'
import * as browser from './browser'
import * as browserRemote from './browserRemote'
import * as cloud from './cloud'
import * as har from './har'
import * as script from './script'
import * as settings from './settings'

interface Services {
  browserServer: BrowserServer
}

export function initialize({ browserServer }: Services) {
  browserRemote.initialize(browserServer)
  auth.initialize()
  cloud.initialize()
  har.initialize()
  browser.initialize(browserServer)
  script.initialize()
  settings.initialize()
}
