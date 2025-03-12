import { BrowserWindow } from 'electron'
import * as auth from './auth'
import * as cloud from './cloud'

interface Services {
  browserWindow: BrowserWindow
}
export function initialize({ browserWindow }: Services) {
  auth.initialize(browserWindow)
  cloud.initialize(browserWindow)
}
