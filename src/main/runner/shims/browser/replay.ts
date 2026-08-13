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

// None of these have a toJSON method natively, so one found there is the
// page's. Date is excluded even though Prototype.js replaces its toJSON too:
// no Date instances ever enter the event graph (timestamps are numbers), and
// deleting Date's toJSON on pages that leave it native would turn dates
// into {}.
const POLLUTABLE_PROTOTYPES: object[] = [
  Array.prototype,
  String.prototype,
  Number.prototype,
  Boolean.prototype,
  Object.prototype,
]

/**
 * Keeps `Array.from` native for the page's lifetime. Pre-JSON frameworks like
 * Prototype.js 1.6 replace it with a version that ignores the map function
 * argument, which breaks rrweb's stylesheet inlining
 * (`Array.from(rules, stringifyRule).join('')` joins raw CSSRule objects into
 * "[object CSSStyleRule]...") and renders every replay unstyled. This script
 * runs before any page script, so the native is still available to pin. The
 * setter silently ignores the page's later assignment: such frameworks call
 * their own helper internally and only alias it onto `Array.from`, so the
 * page keeps working.
 */
function pinNativeArrayFrom() {
  const nativeFrom = Array.from

  try {
    Object.defineProperty(Array, 'from', {
      configurable: false,
      get: () => nativeFrom,
      set: () => {},
    })
  } catch {
    // Not configurable: either already pinned by another copy of this script
    // or locked down by the page. Nothing to do either way.
  }
}

/**
 * JSON.stringify that ignores toJSON methods the page added to the shared
 * prototypes. Pre-JSON frameworks like Prototype.js 1.6 add toJSON methods
 * that return already-serialized text, which double-encodes every array and
 * string in the batch and gets it rejected by the tracking server. This runs
 * in the page's own world (the k6 browser module can only inject there), so
 * the pollution can't be avoided, only sidestepped: the methods are removed
 * for the duration of the (synchronous) stringify and restored right after,
 * so the page never observes the gap.
 */
function stringifyIgnoringPageToJSON(value: unknown): string {
  const removed: Array<{ prototype: object; descriptor: PropertyDescriptor }> =
    []

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
