import { ipcRenderer } from 'electron'

import { UsageEvent } from '@/services/usageTracking/types'

import { createListener } from '../utils'

import { AppHandler } from './types'

export const platform = process.platform

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

let pendingDeepLink: string | null = null
let deepLinkCallback: ((url: string) => void) | null = null

ipcRenderer.on(AppHandler.Navigate, (_, url: string) => {
  if (deepLinkCallback) {
    deepLinkCallback(url)
  } else {
    pendingDeepLink = url
  }
})

export function onDeepLink(callback: (url: string) => void) {
  deepLinkCallback = callback

  if (pendingDeepLink) {
    callback(pendingDeepLink)
    pendingDeepLink = null
  }

  return () => {
    deepLinkCallback = null
  }
}
