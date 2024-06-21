import { ProxyData } from '@/types'
import { reverse, uniqBy } from 'lodash-es'

// We get 2 requests with the same id, one when
// the request is sent and another when the response is received
export function mergeRequestsById(requests: ProxyData[]) {
  // Reverse to keep the latest request
  return reverse(uniqBy(reverse(requests), 'id'))
}

function onProxyStarted() {
  return new Promise<void>((resolve) => {
    window.studio.proxy.onProxyStarted(resolve)
  })
}

function onBrowserStarted() {
  return new Promise<void>((resolve) => {
    window.studio.browser.onBrowserStarted(resolve)
  })
}

// TODO: add error and timeout handling
export async function startRecording() {
  // Kill previous browser window
  window.studio.browser.stopBrowser()

  window.studio.browser.launchBrowser()
  await onBrowserStarted()
}

export function stopRecording() {
  window.studio.browser.stopBrowser()
}
