import { BrowserWindow } from 'electron'
import { BrowserServer } from '@/services/browser/server'
import * as browserRemote from './browserRemote'
import * as auth from './auth'
import * as cloud from './cloud'

interface Services {
  browserServer: BrowserServer
  browserWindow: BrowserWindow
}

export function initialize({ browserServer, browserWindow }: Services) {
  browserRemote.initialize(browserServer)
  auth.initialize(browserWindow)
  cloud.initialize(browserWindow)
}
