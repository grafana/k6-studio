import { ipcRenderer } from 'electron'

import { createListener } from '../utils'

import { AppHandler } from './types'

export const platform = process.platform

export function closeSplashscreen() {
  ipcRenderer.send(AppHandler.SPLASHSCREEN_CLOSE)
}

export function onApplicationClose(callback: () => void) {
  return createListener(AppHandler.CLOSE, callback)
}

export function closeApplication() {
  ipcRenderer.send(AppHandler.CLOSE)
}

export function changeRoute(route: string) {
  return ipcRenderer.send(AppHandler.CHANGE_ROUTE, route)
}

export function onDeepLink(callback: (url: string) => void) {
  return createListener(AppHandler.DEEP_LINK, callback)
}
