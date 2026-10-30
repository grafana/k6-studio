import { EventType } from '@rrweb/types'
import { record } from 'rrweb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { parseReplayEvent } from '../../rrweb'
import { BrowserReplayEvent } from '../../schema'

vi.mock('rrweb', () => ({
  record: Object.assign(vi.fn(), {
    mirror: { getId: vi.fn(() => -1) },
  }),
}))

interface ReplayGlobals {
  __K6_SESSION_REPLAY_TRACKING_SERVER_URL__?: string | null
  __K6_REPLAY_PAGE_ID__?: string
  __K6_DRAIN_EVENTS__?: Window['__K6_DRAIN_EVENTS__']
}

const replayWindow = window as ReplayGlobals
let restoreMessageListeners = () => {}

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
  const addEventListener = vi.spyOn(window, 'addEventListener')
  restoreMessageListeners = () => {
    addEventListener.mock.calls
      .filter(([type]) => type === 'message')
      .forEach(([, listener]) => {
        window.removeEventListener('message', listener as EventListener)
      })
    addEventListener.mockRestore()
    delete window.__K6_REPLAY_OWNER_READY__
  }

  delete replayWindow.__K6_DRAIN_EVENTS__
  delete replayWindow.__K6_REPLAY_PAGE_ID__
  replayWindow.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = 'http://localhost:0'
})

afterEach(() => restoreMessageListeners())

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

  it('enables rrweb cross-origin iframe recording in the top frame', async () => {
    await importReplayScript()

    expect(getRecordOptions().recordCrossOriginIframes).toBe(true)
  })

  it('starts child recording only after its parent grants the owner frame', async () => {
    const parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent')
    let requestedToken = ''
    const parent = {
      postMessage: vi.fn(
        (message: { token: string }, _targetOrigin: string) => {
          requestedToken = message.token
        }
      ),
    }

    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parent,
    })

    try {
      await importReplayScript()
      expect(record).not.toHaveBeenCalled()

      window.dispatchEvent(
        new MessageEvent('message', {
          source: parent as unknown as Window,
          data: { type: 'k6-replay-start', token: requestedToken },
        })
      )

      const options = getRecordOptions()

      expect(options.recordCrossOriginIframes).toBe(true)
      expect(options.recordAfter).toBe('DOMContentLoaded')
      expect(replayWindow.__K6_REPLAY_PAGE_ID__).toBeUndefined()
      expect(replayWindow.__K6_DRAIN_EVENTS__).toBeUndefined()
      expect(options.emit?.(createEvent(1))).toBeUndefined()
    } finally {
      if (parentDescriptor !== undefined) {
        Object.defineProperty(window, 'parent', parentDescriptor)
      } else {
        Reflect.deleteProperty(window, 'parent')
      }
    }
  })

  it('retries its request when the parent becomes ready later', async () => {
    const parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent')
    const parent = { postMessage: vi.fn() }
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parent,
    })

    try {
      await importReplayScript()
      expect(parent.postMessage).toHaveBeenCalledTimes(1)

      window.dispatchEvent(
        new MessageEvent('message', {
          source: parent as unknown as Window,
          data: { type: 'k6-replay-recheck' },
        })
      )

      expect(parent.postMessage).toHaveBeenCalledTimes(2)
      expect(record).not.toHaveBeenCalled()
    } finally {
      if (parentDescriptor !== undefined) {
        Object.defineProperty(window, 'parent', parentDescriptor)
      } else {
        Reflect.deleteProperty(window, 'parent')
      }
    }
  })

  it('grants a child only after rrweb has serialized its owner', async () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const child = iframe.contentWindow
    if (child === null) throw new Error('missing child window')
    const postMessage = vi.spyOn(child, 'postMessage')
    const getId = vi.spyOn(record.mirror, 'getId')

    try {
      await importReplayScript()
      window.dispatchEvent(
        new MessageEvent('message', {
          source: child,
          data: { type: 'k6-replay-request', token: 'child-document' },
        })
      )
      expect(postMessage).not.toHaveBeenCalledWith(
        { type: 'k6-replay-start', token: 'child-document' },
        '*'
      )

      getId.mockReturnValue(1)
      emitEvent(createEvent(1))

      expect(postMessage).toHaveBeenCalledWith(
        { type: 'k6-replay-start', token: 'child-document' },
        '*'
      )
    } finally {
      postMessage.mockRestore()
      getId.mockRestore()
      iframe.remove()
    }
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

  // Prototype.js 1.6 (still served by legacy sites) predates native JSON
  // and adds toJSON methods that return already-serialized text to the shared
  // prototypes. JSON.stringify honors them, double-encoding every array and
  // string, and the tracking server then rejects the whole batch: the replay
  // shows up blank while the test itself passes.
  describe('on a page that pollutes prototypes with toJSON', () => {
    beforeEach(() => {
      // What Prototype 1.6.0.3 does, reduced to the serialization behavior.
      Object.defineProperty(Array.prototype, 'toJSON', {
        value: function toJSON(this: unknown[]) {
          return `[${this.map((item) => JSON.stringify(item)).join(', ')}]`
        },
        writable: true,
        configurable: true,
      })
      // String pollution stays untouched by the drain: JSON.stringify only
      // consults it for boxed strings, which never enter the event graph.
      Object.defineProperty(String.prototype, 'toJSON', {
        value: function toJSON(this: string) {
          return `"${this.toString()}"`
        },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Reflect.deleteProperty(Array.prototype, 'toJSON')
      Reflect.deleteProperty(String.prototype, 'toJSON')
    })

    it('still serializes the batch as an array of events', async () => {
      await importReplayScript()

      emitEvent(createEvent(1, { text: 'typed into the page' }))

      const batch = drainedBatch()

      expect(Array.isArray(batch.events)).toBe(true)
      expect(batch.events).toContainEqual(
        createEvent(1, { text: 'typed into the page' })
      )
    })

    it('leaves the page pollution in place after draining', async () => {
      await importReplayScript()

      drain()

      // The page's own code relies on its patched prototypes, so the drain
      // must put them back exactly as they were.
      expect(
        Object.getOwnPropertyDescriptor(Array.prototype, 'toJSON')
      ).toBeDefined()
      expect(
        Object.getOwnPropertyDescriptor(String.prototype, 'toJSON')
      ).toBeDefined()
    })

    // Prototype.js also replaces Array.from with a version that ignores the
    // map function argument. rrweb inlines stylesheets with
    // Array.from(rules, stringifyRule).join(''), which then joins raw CSSRule
    // objects into "[object CSSStyleRule]..." and every replay renders
    // unstyled. The script pins Array.from against later replacement.
    it('keeps Array.from working when the page later replaces it', async () => {
      await importReplayScript()

      // Plain assignment like Prototype's `Array.from = $A`, replacing it
      // with a version that drops the map function. Must neither throw nor
      // take effect.
      expect(() => {
        Object.assign(Array, { from: () => [] })
      }).not.toThrow()

      expect(Array.from([1, 2], (value) => value * 2)).toEqual([2, 4])
    })

    // Self-hosted polyfill bundles install Array.from with an unconditional
    // Object.defineProperty, which throws against a pin the page cannot
    // reconfigure and leaves an uncaught TypeError on a page that only breaks
    // while session replay is on. The polyfill takes the property over: an
    // unstyled replay is a better outcome than a broken page.
    it('lets the page redefine Array.from with defineProperty', async () => {
      await importReplayScript()

      const nativeFrom = Array.from
      const polyfilled = () => []

      try {
        expect(() => {
          Object.defineProperty(Array, 'from', {
            value: polyfilled,
            writable: true,
            configurable: true,
          })
        }).not.toThrow()

        expect(Array.from).toBe(polyfilled)
      } finally {
        Reflect.defineProperty(Array, 'from', {
          value: nativeFrom,
          writable: true,
          configurable: true,
        })
      }
    })
  })
})
