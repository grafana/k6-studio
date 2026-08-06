import { EventType } from '@rrweb/types'
import { record } from 'rrweb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { parseReplayEvent } from '../../rrweb'
import { BrowserReplayEvent } from '../../schema'

vi.mock('rrweb', () => ({
  record: vi.fn(),
}))

interface ReplayGlobals {
  __K6_SESSION_REPLAY_TRACKING_SERVER_URL__?: string | null
  __K6_DRAIN_EVENTS__?: Window['__K6_DRAIN_EVENTS__']
}

const replayWindow = window as ReplayGlobals

async function importReplayScript() {
  vi.resetModules()

  await import('./replay')
}

function drain(received: Record<string, number> = {}) {
  const drainEvents = replayWindow.__K6_DRAIN_EVENTS__

  if (drainEvents === undefined) {
    throw new Error('drain function was not installed')
  }

  return drainEvents(received)
}

interface Batch {
  pageId: string
  batchId: number
  events: BrowserReplayEvent[]
}

// Mirrors the header parsing on the k6 side so the two can't drift
function drainedBatch(received: Record<string, number> = {}): Batch {
  const payload = drain(received)

  if (payload === undefined) {
    throw new Error('expected a batch, the drain returned nothing')
  }

  const firstBreak = payload.indexOf('\n')
  const secondBreak = payload.indexOf('\n', firstBreak + 1)

  return {
    pageId: payload.slice(0, firstBreak),
    batchId: Number(payload.slice(firstBreak + 1, secondBreak)),
    events: JSON.parse(payload.slice(secondBreak + 1)) as BrowserReplayEvent[],
  }
}

function pageStartOf(batch: Batch) {
  const [event] = batch.events

  // Validate against the schema the player uses so the shapes can't drift
  const parsed = parseReplayEvent(event)
  const data = parsed.data

  if (data.tag !== 'page-start') {
    throw new Error(`Expected a page-start event, got "${data.tag}"`)
  }

  return { type: parsed.type, payload: data.payload }
}

function getRecordOptions() {
  const [options] = vi.mocked(record).mock.calls[0] ?? []

  if (options === undefined) {
    throw new Error('record was not called')
  }

  return options
}

function emitEvent(event: BrowserReplayEvent) {
  getRecordOptions().emit?.(event)
}

function createEvent(timestamp: number, data: unknown = {}) {
  return {
    type: EventType.FullSnapshot,
    data,
    timestamp,
  } as BrowserReplayEvent
}

beforeEach(() => {
  vi.clearAllMocks()

  delete replayWindow.__K6_DRAIN_EVENTS__
  replayWindow.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = 'http://localhost:0'
})

describe('session replay in-page script', () => {
  it('exposes a drain function returning the page-start event as JSON', async () => {
    await importReplayScript()

    const batch = drainedBatch()
    const pageStart = pageStartOf(batch)

    expect(pageStart.type).toBe(EventType.Custom)
    expect(pageStart.payload.href).toBe(window.location.href)
  })

  it('uses the same page id in the header and the page-start payload', async () => {
    await importReplayScript()

    const batch = drainedBatch()

    expect(batch.pageId).toBe(pageStartOf(batch).payload.pageId)
  })

  // The k6 side serializes pulls per page to avoid handing out the same
  // unacked batch twice, and it needs a stable id to do so: the Page wrappers
  // it gets from context.pages() are fresh objects on every call.
  it('exposes the page id on the window', async () => {
    await importReplayScript()

    const pageId = (window as { __K6_REPLAY_PAGE_ID__?: string })
      .__K6_REPLAY_PAGE_ID__

    expect(pageId).toBe(drainedBatch().pageId)
  })

  it('numbers the first batch 1 so a missing ack means nothing was received', async () => {
    await importReplayScript()

    expect(drainedBatch().batchId).toBe(1)
  })

  // k6 v2.0.0 marshals an empty object argument of page.evaluate into
  // undefined, and the ack map is empty until the first batch is acked, so
  // every pull would throw and the recording never left the page.
  it('drains when the ack map argument is missing', async () => {
    await importReplayScript()

    const drainEvents = replayWindow.__K6_DRAIN_EVENTS__
    const payload = drainEvents?.(
      undefined as unknown as Record<string, number>
    )

    expect(payload).toContain('page-start')
  })

  it('re-sends an unacked batch merged with newer events', async () => {
    await importReplayScript()

    const first = drainedBatch()
    const event = createEvent(1)

    emitEvent(event)

    const second = drainedBatch()

    expect(second.batchId).toBe(2)
    expect(second.events).toEqual([...first.events, event])
  })

  it('drops a batch once it has been acked', async () => {
    await importReplayScript()

    const first = drainedBatch()
    const event = createEvent(1)

    emitEvent(event)

    const second = drainedBatch({ [first.pageId]: first.batchId })

    expect(second.events).toEqual([event])
  })

  it('keeps re-sending when the ack is for another page', async () => {
    await importReplayScript()

    const first = drainedBatch()
    const second = drainedBatch({ 'another-page': first.batchId })

    expect(second.events).toEqual(first.events)
  })

  it('returns nothing and keeps the batch counter when there is nothing to send', async () => {
    await importReplayScript()

    const first = drainedBatch()

    expect(drain({ [first.pageId]: first.batchId })).toBeUndefined()

    emitEvent(createEvent(1))

    expect(drainedBatch().batchId).toBe(2)
  })

  it('drains events emitted by rrweb', async () => {
    await importReplayScript()

    const first = drainedBatch()
    const event = createEvent(1)

    emitEvent(event)

    expect(drainedBatch({ [first.pageId]: first.batchId }).events).toEqual([
      event,
    ])
  })

  it('escapes newlines in events so the header separators stay unambiguous', async () => {
    await importReplayScript()

    emitEvent(createEvent(1, { text: 'first\nsecond' }))

    const payload = drain()

    expect(payload?.split('\n')).toHaveLength(3)
  })

  it('does not send events with fetch', async () => {
    vi.useFakeTimers()

    const fetchSpy = vi.spyOn(window, 'fetch')

    try {
      await importReplayScript()

      await vi.advanceTimersByTimeAsync(1000)

      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('starts recording on DOMContentLoaded so short-lived pages are captured', async () => {
    await importReplayScript()

    expect(getRecordOptions().recordAfter).toBe('DOMContentLoaded')
  })

  it('records even when crypto.randomUUID is unavailable', async () => {
    // Insecure contexts (plain http pages) don't have crypto.randomUUID.
    // Shadow the prototype method with an own property and delete it after.
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    })

    try {
      await importReplayScript()

      const batch = drainedBatch()

      expect(pageStartOf(batch).payload.pageId).toMatch(/\S/)
      expect(batch.pageId).toMatch(/\S/)
    } finally {
      Reflect.deleteProperty(crypto, 'randomUUID')
    }
  })

  it('does not record when the tracking server url is missing', async () => {
    replayWindow.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = null

    await importReplayScript()

    expect(replayWindow.__K6_DRAIN_EVENTS__).toBeUndefined()
    expect(vi.mocked(record)).not.toHaveBeenCalled()
  })
})
