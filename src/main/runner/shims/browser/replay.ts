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

// JSON.stringify consults toJSON on object values only, and rrweb event
// graphs are plain objects, arrays, and primitives, so these two are the only
// prototypes whose pollution can reach the payload (String, Number, and
// Boolean toJSON fire for boxed primitives only, and Date instances never
// enter the graph). Neither has a toJSON natively, so one found there is the
// page's.
const POLLUTABLE_PROTOTYPES: object[] = [Array.prototype, Object.prototype]

/**
 * Pre-JSON frameworks like Prototype.js 1.6 replace Array.from with a version
 * that doesn't support the map function argument. rrweb uses the `map` argument
 * when recording stylesheets so we need to restore the native function, otherwise
 * stylesheets will be recorded as `"[object CSSStyleRule]..."`.
 */
function pinNativeArrayFrom() {
  const nativeFrom = Array.from

  // Fails only when the page locked the property down, and there is nothing
  // to do about that. A second copy of this script re-pins the native it
  // reads back through the getter.
  Reflect.defineProperty(Array, 'from', {
    configurable: true,
    get: () => nativeFrom,
    set: () => {},
  })
}

/**
 * Pre-JSON frameworks like Prototype.js 1.6 adds toJSON methods to the prototypes
 * of Array and Object. These methods returns an already serialized version of the object,
 * so passing it to JSON.stringify would double-serialize it. This function serializes
 * values without calling toJSON on the prototype of Object and Array.
 */
function stringifyIgnoringPageToJSON(value: unknown): string {
  const removed: Array<{ prototype: object; descriptor: PropertyDescriptor }> =
    []

  // Remove toJSON from the prototypes so that JSON.stringify doesn't call them
  for (const prototype of POLLUTABLE_PROTOTYPES) {
    const descriptor = Reflect.getOwnPropertyDescriptor(prototype, 'toJSON')

    if (
      descriptor !== undefined &&
      Reflect.deleteProperty(prototype, 'toJSON')
    ) {
      removed.push({ prototype, descriptor })
    }
  }

  try {
    return JSON.stringify(value)
  } finally {
    // Restore the prototypes to their original state so that the page can continue
    for (const { prototype, descriptor } of removed) {
      Reflect.defineProperty(prototype, 'toJSON', descriptor)
    }
  }
}

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
  pinNativeArrayFrom()

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
    return `${pageId}\n${nextBatchId}\n${stringifyIgnoringPageToJSON(events)}`
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
