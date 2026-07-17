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

// Serialization options must match between the top frame and child frames:
// with `recordCrossOriginIframes`, each frame serializes its own document and
// rrweb stitches the events together in the top frame's stream.
const RECORD_OPTIONS = {
  blockSelector: "link[rel='modulepreload']",
  inlineImages: true,
  inlineStylesheet: true,
  collectFonts: true,
  slimDOMOptions: true,
  // The browser runs with web security enabled, so the top frame's serializer
  // can't reach into cross-origin iframe documents. Instead rrweb records
  // inside each frame (this script is a context init script, so it runs in
  // every frame) and forwards child events to the top frame over postMessage.
  recordCrossOriginIframes: true,
} as const

if (trackingServerUrl !== null && !isTopLevelFrame()) {
  // Child frame: serialize locally and let rrweb forward events to the top
  // frame. The emit callback is required by the API but never called here.
  record({
    ...RECORD_OPTIONS,
    emit() {},
  })
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
    ...RECORD_OPTIONS,
    emit(event) {
      buffer.push(event)
    },
  })
}
