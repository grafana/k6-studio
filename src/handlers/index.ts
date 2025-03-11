import { BrowserWindow } from 'electron'
import { BrowserServer } from '@/services/browser/server'
import * as browserRemote from './browserRemote'
import * as auth from './auth'

interface Services {
  browserServer: BrowserServer
  browserWindow: BrowserWindow
}

export function initialize({ browserServer, browserWindow }: Services) {
  browserRemote.initialize(browserServer)
  auth.initialize(browserWindow)
}
