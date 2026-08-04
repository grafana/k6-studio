import { BrowserContext, Page } from 'k6/browser'

import { postTracking, TRACKING_SERVER_URL } from '../utils'

import { onActionEnd } from './utils'

declare module 'k6/browser' {
  interface Page {
    // The pull currently in flight on this page. Overlapping pulls would each
    // return the page's unacked batch, duplicating events downstream.
    __replayPull?: Promise<void>
  }
}

// Roughly a few seconds of a busy page. Beyond that the tracking server is gone
// or wedged and holding on to the events only grows the k6 process.
const OUTBOX_LIMIT = 100

// A wedged page must not hold up the end of the iteration forever.
const FLUSH_TIMEOUT = 3000

const contexts = new Set<BrowserContext>()

// pageId -> highest batch id that made it out of the page. Sent back on every
// pull so the page knows which batch it can forget.
const received: Record<string, number> = {}

const outbox: string[] = []

let pumping: Promise<void> | null = null
let outboxOverflowed = false

export function registerContext(context: BrowserContext) {
  contexts.add(context)
}

function enqueue(body: string) {
  // A rejected body goes back to the head, so the queue can sit above the limit
  if (outbox.length >= OUTBOX_LIMIT) {
    outbox.shift()

    if (!outboxOverflowed) {
      outboxOverflowed = true

      console.warn(
        'Session replay events are piling up, dropping the oldest ones'
      )
    }
  }

  outbox.push(body)
}

async function sendOutbox() {
  while (outbox.length > 0) {
    const body = outbox.shift()

    if (body === undefined) {
      return
    }

    let accepted = false

    try {
      accepted = await postTracking('/session-replay', body)
    } catch {
      // A request can fail synchronously, which must not stop the pump from
      // being restarted by the next drain.
    }

    if (!accepted) {
      outbox.unshift(body)

      return
    }
  }
}

/**
 * Sends the queued bodies one at a time, in the order they were pulled. The
 * tracking server appends events as they arrive, so overtaking would scramble
 * the recording.
 */
function pump() {
  pumping ??= sendOutbox()
    .catch(() => undefined)
    .finally(() => {
      pumping = null
    })

  return pumping
}

async function pullPage(page: Page) {
  try {
    // Covers pages torn down by context.close(), browser shutdown or a crash,
    // which never go through the page.close() proxy.
    if (page.isClosed()) {
      return
    }

    // The page serializes the events itself so the k6 runtime receives one
    // string instead of rebuilding a multi-megabyte object graph per pull.
    const payload = await page.evaluate<string | undefined, typeof received>(
      (received) => window.__K6_DRAIN_EVENTS__?.(received),
      received
    )

    // k6 marshals an in-page `undefined` into null, so both mean "no events"
    if (payload == null) {
      return
    }

    const pageIdEnd = payload.indexOf('\n')
    const batchIdEnd = payload.indexOf('\n', pageIdEnd + 1)

    const pageId = payload.slice(0, pageIdEnd)
    const batchId = Number(payload.slice(pageIdEnd + 1, batchIdEnd))

    // Acking only once the body is queued keeps the batch retained in the page
    // for as long as it could still be lost.
    enqueue(`{"events":${payload.slice(batchIdEnd + 1)}}`)

    received[pageId] = batchId

    void pump()
  } catch {
    // Draining must never break the action that triggered it.
  }
}

/**
 * Pulls the events buffered in a single page. Pulls on the same page run one
 * after the other, but each one reads the page fresh, so a pull started before
 * a navigation always sees everything the page recorded up to that point.
 */
export function drainPage(page: Page) {
  const pull = (page.__replayPull ?? Promise.resolve()).then(() => {
    return pullPage(page)
  })

  page.__replayPull = pull

  return pull
}

function drainAllPages() {
  const pulls: Array<Promise<void>> = []

  for (const context of contexts) {
    try {
      // Pages are enumerated per drain because popups opened by the page never
      // pass through the newPage proxy.
      for (const page of context.pages()) {
        pulls.push(drainPage(page))
      }
    } catch {
      // pages() throws once the context is closed
      contexts.delete(context)
    }
  }

  return Promise.all(pulls)
}

function withTimeout(promise: Promise<unknown>, timeout: number) {
  let timer: ReturnType<typeof setTimeout>

  const expired = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeout)
  })

  return Promise.race([promise, expired]).then(() => {
    clearTimeout(timer)
  })
}

/**
 * Pulls buffered session replay events out of every open page and forwards
 * them to the tracking server. The page can't send them itself: a fetch to
 * the localhost tracking server is blocked on sites with a CSP `connect-src`
 * allowlist, while evaluate goes over CDP and can't be blocked by the page.
 */
export async function drainReplayEvents() {
  if (TRACKING_SERVER_URL === null) {
    return
  }

  await drainAllPages()

  void pump()
}

/**
 * Drains every page and waits for the events to reach the tracking server.
 * Used when the pages are about to go away, where fire-and-forget posts would
 * be cut short.
 */
export function flushReplayEvents() {
  if (TRACKING_SERVER_URL === null) {
    return Promise.resolve()
  }

  const delivered = drainAllPages().then(() => pump())

  return withTimeout(delivered, FLUSH_TIMEOUT)
}

// Ship replay events recorded up to each action so the preview streams live
onActionEnd(() => {
  void drainReplayEvents()
})
