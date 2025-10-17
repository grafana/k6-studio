import { ipcRenderer } from 'electron'

import { UsageEvent } from '@/services/usageTracking/types'

import { createListener } from '../utils'

import { AppHandler } from './types'

export const platform = process.platform

export function closeSplashscreen() {
  ipcRenderer.send(AppHandler.SplashscreenClose)
}

export function onApplicationClose(callback: () => void) {
  return createListener(AppHandler.Close, callback)
}

export function closeApplication() {
  ipcRenderer.send(AppHandler.Close)
}

export function changeRoute(route: string) {
  return ipcRenderer.send(AppHandler.ChangeRoute, route)
}

export function trackEvent(event: UsageEvent) {
  return ipcRenderer.send(AppHandler.TrackEvent, event)
}

export function onDeepLink(callback: (url: string) => void) {
  return createListener(AppHandler.DeepLink, callback)
}
