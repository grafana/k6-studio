import { BrowserWindow } from 'electron'

import { BrowserServer } from '@/services/browser/server'

import * as auth from './auth'
import * as browser from './browser'
import * as browserRemote from './browserRemote'
import * as cloud from './cloud'
import * as har from './har'

interface Services {
  browserServer: BrowserServer
  browserWindow: BrowserWindow
}

export function initialize({ browserServer }: Services) {
  browserRemote.initialize(browserServer)
  auth.initialize()
  cloud.initialize()
  har.initialize()
  browser.initialize(browserServer)
}
