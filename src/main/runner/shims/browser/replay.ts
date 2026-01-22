import { EventType, eventWithTime } from '@rrweb/types'
import { record } from 'rrweb'

import type { PageStartEvent } from '../../rrweb'

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
  let buffer: eventWithTime[] = [
    {
      type: EventType.Custom,
      data: {
        tag: 'page-start',
        payload: {
          title: document.title,
          href: window.location.href,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      } satisfies PageStartEvent,
      timestamp: Date.now(),
    },
  ]

  setTimeout(async function send() {
    if (buffer.length > 0) {
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
        // Put events back in the buffer and retry later
        buffer = [...events, ...buffer]
      }
    }

    setTimeout(send, 200)
  }, 200)

  record({
    emit(event) {
      buffer.push(event)
    },
  })
}
