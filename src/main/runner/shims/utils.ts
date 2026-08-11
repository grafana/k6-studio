import http from 'k6/http'

import { BrowserDebuggerBeginEvent, BrowserDebuggerEndEvent } from '../schema'

export const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT
  ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}`
  : null

/**
 * Posts to the tracking server without blocking the caller. Resolves to
 * whether the server accepted the body. Errors are swallowed so tracking never
 * interferes with script execution.
 */
export function postTracking(path: string, body: string): Promise<boolean> {
  if (TRACKING_SERVER_URL === null) {
    return Promise.resolve(false)
  }

  try {
    return http
      .asyncRequest('POST', `${TRACKING_SERVER_URL}${path}`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(
        // A 4xx or 5xx resolves with a response instead of rejecting.
        (response) => response.status >= 200 && response.status < 300,
        () => false
      )
  } catch {
    // A request can also fail synchronously, e.g. when the k6 runtime is
    // tearing down the iteration.
    return Promise.resolve(false)
  }
}

export class TrackingClient {
  name: string
  currentId: number

  constructor(name: string) {
    this.name = name
    this.currentId = 0
  }

  nextId() {
    return `${this.name}-${this.currentId++}`
  }

  begin<T extends BrowserDebuggerBeginEvent>(event: T) {
    try {
      const body = JSON.stringify(event)

      http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/begin`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // We don't want to interfere with the script execution so
      // we swallow all errors here.
      return null
    }

    return event
  }

  end<T extends BrowserDebuggerEndEvent>(event: T) {
    try {
      const body = JSON.stringify(event)

      http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/end`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // We don't want to interfere with the script execution so
      // we swallow all errors here.
    }
  }
}
