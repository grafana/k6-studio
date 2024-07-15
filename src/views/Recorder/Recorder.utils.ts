import { ProxyData } from '@/types'

// We get 2 requests with the same id, one when
// the request is sent and another when the response is received
export function mergeRequestsById(previous: ProxyData[], proxyData: ProxyData) {
  const existingRequestIndex = previous.findIndex(
    (request) => request.id === proxyData.id
  )

  if (existingRequestIndex !== -1) {
    return previous.map((request) => {
      if (request.id === proxyData.id) {
        return {
          ...proxyData,
          // When response is received it will not have the group in comment,
          // so we need to copy it from the request
          comment: previous[existingRequestIndex]?.comment,
        }
      }

      return request
    })
  }

  return [...previous, proxyData]
}

// TODO: add error and timeout handling
export async function startRecording() {
  // Kill previous browser window
  window.studio.browser.stopBrowser()

  return window.studio.browser.launchBrowser()
}

export function stopRecording() {
  window.studio.browser.stopBrowser()
}
