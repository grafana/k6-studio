import http from 'k6/http'

import { LogEntry } from '@/schemas/k6'

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

export function trackLog(entry: LogEntry) {
  if (TRACKING_SERVER_URL === null) {
    return
  }

  const body = JSON.stringify(entry)

  // Blocking the `page.on("console")` handler will cause the browser to hang
  // for extended periods of time so we use asyncRequest here to avoid blocking.
  http
    .asyncRequest('POST', `${TRACKING_SERVER_URL}/log`, body, {
      headers: { 'Content-Type': 'application/json' },
    })
    .catch(() => {
      // We don't want to interfere with the script execution so
      // we swallow all errors here.
    })
}

export function sendBeginEvent<T extends BrowserDebuggerBeginEvent>(event: T) {
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

export function sendEndEvent<T extends BrowserDebuggerEndEvent>(event: T) {
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
