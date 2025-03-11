import { BrowserWindow } from 'electron'
import * as auth from './auth'

interface Services {
  browserWindow: BrowserWindow
}
export function initialize({ browserWindow }: Services) {
  auth.initialize(browserWindow)
}
