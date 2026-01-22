import { EventType } from '@rrweb/types'
import { record } from 'rrweb'

import type { PageStartEvent } from '../../rrweb'
import type { BrowserReplayEvent } from '../../schema'

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
  let buffer: BrowserReplayEvent[] = [
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

      const url = `${trackingServerUrl}/session-replay`
      const init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      }

      const success = await fetch(url, init)
        .then((response) => response.ok)
        .catch(() => false)

      if (!success) {
        // Put events back in the buffer and retry later
        buffer = [...events, ...buffer]
      }
    }

    setTimeout(send, 200)
  }, 200)

  record({
    blockSelector: "link[rel='modulepreload']",
    inlineImages: true,
    inlineStylesheet: true,
    collectFonts: true,
    slimDOMOptions: true,
    emit(event) {
      buffer.push(event)
    },
  })
}
