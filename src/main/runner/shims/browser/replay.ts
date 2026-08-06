import { EventType } from '@rrweb/types'
import { record } from 'rrweb'

import type { PageStartEvent } from '../../rrweb'
import type { BrowserReplayEvent } from '../../schema'

declare global {
  interface Window {
    __K6_SESSION_REPLAY_TRACKING_SERVER_URL__: string | null
    __K6_REPLAY_PAGE_ID__?: string
    __K6_DRAIN_EVENTS__?: (
      received: Record<string, number>
    ) => string | undefined
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

function createPageId() {
  // crypto.randomUUID is unavailable in insecure contexts (plain http pages)
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

// Events are buffered here and pulled from the k6 process, see the drain
// function in replayDrain.ts for why they can't be pushed with fetch.
if (trackingServerUrl !== null && isTopLevelFrame()) {
  const pageId = createPageId()

  // The k6 side serializes pulls per page and needs a stable id for that: the
  // Page wrappers it gets from context.pages() are fresh objects every call.
  window.__K6_REPLAY_PAGE_ID__ = pageId

  let buffer: BrowserReplayEvent[] = [
    {
      type: EventType.Custom,
      data: {
        tag: 'page-start',
        payload: {
          pageId,
          title: document.title,
          href: window.location.href,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      } satisfies PageStartEvent,
      timestamp: Date.now(),
    },
  ]

  // The last batch handed out stays here until the k6 process acks it, so
  // events survive a failed pull instead of being lost with the buffer.
  let retained: { id: number; events: BrowserReplayEvent[] } | null = null
  let nextBatchId = 0

  window.__K6_DRAIN_EVENTS__ = (received) => {
    // k6 v2.0.0 marshals an empty object argument of page.evaluate into
    // undefined, and the ack map is empty until the first batch is acked.
    const acked = received?.[pageId]

    if (retained !== null && acked !== undefined && acked >= retained.id) {
      retained = null
    }

    const events = retained === null ? buffer : [...retained.events, ...buffer]

    buffer = []

    if (events.length === 0) {
      return undefined
    }

    nextBatchId += 1
    retained = { id: nextBatchId, events }

    // Serialized here so the k6 runtime receives a single string instead of
    // rebuilding the whole event graph on its side. JSON.stringify escapes
    // newlines, which keeps the two header separators unambiguous.
    return `${pageId}\n${nextBatchId}\n${JSON.stringify(events)}`
  }

  record({
    blockSelector: "link[rel='modulepreload']",
    inlineImages: true,
    inlineStylesheet: true,
    collectFonts: true,
    slimDOMOptions: true,
    // The default of 'load' can take many seconds on heavy pages, losing every
    // page the test navigates away from before then.
    recordAfter: 'DOMContentLoaded',
    emit(event) {
      buffer.push(event)
    },
  })
}
