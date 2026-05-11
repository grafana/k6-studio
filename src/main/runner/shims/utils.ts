import http from 'k6/http'

import { BrowserDebuggerBeginEvent, BrowserDebuggerEndEvent } from '../schema'

export const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT
  ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}`
  : null

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
