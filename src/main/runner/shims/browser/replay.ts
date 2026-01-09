import { eventWithTime } from '@rrweb/types'
import { record } from 'rrweb'

declare global {
  interface Window {
    __K6_SESSION_REPLAY_TRACKING_SERVER_URL__: string | null
  }
}

const trackingServerUrl = window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__

function isTopLevelFrame() {
  try {
    return window.parent === window
  } catch {
    return false
  }
}

if (trackingServerUrl !== null && isTopLevelFrame()) {
  console.log('Session replay script loaded.', window.location.href)

  let buffer: eventWithTime[] = []

  setInterval(async () => {
    if (buffer.length === 0) {
      return
    }

    const events = buffer

    buffer = []

    try {
      const url = `${trackingServerUrl}/session-replay`

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (err) {
      // Swallow errors to not interfere with the main script
    }
  }, 200)

  console.log('Starting session replay recording.')

  record({
    emit(event) {
      buffer.push(event)
    },
  })
}
