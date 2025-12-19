import { eventWithTime } from '@rrweb/types'
import { record } from 'rrweb'

declare global {
  interface Window {
    __K6_SESSION_REPLAY_TRACKING_SERVER_URL__: string | null
  }
}

const trackingServerUrl = window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__

let buffer: eventWithTime[] = []
let pending: NodeJS.Timeout | null = null

if (trackingServerUrl !== null) {
  record({
    emit(event) {
      buffer.push(event)

      if (pending !== null) {
        return
      }

      pending = setTimeout(async () => {
        if (trackingServerUrl === null) {
          return
        }

        const events = buffer

        buffer = []
        pending = null

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
    },
  })
}

export {}
