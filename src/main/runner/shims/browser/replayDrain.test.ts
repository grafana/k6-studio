import { EventType } from '@rrweb/types'
import { BrowserContext, Page } from 'k6/browser'
import { RefinedResponse, ResponseType } from 'k6/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BrowserReplayEvent } from '../../schema'
import '../symbols'

vi.hoisted(() => {
  ;(globalThis as { __ENV?: Record<string, string> }).__ENV = {
    K6_TRACKING_SERVER_PORT: '1234',
  }
})

function deferred<T>() {
  let resolve: (value: T) => void = () => {}

  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

function httpResponse(status: number) {
  return { status } as unknown as RefinedResponse<ResponseType | undefined>
}

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function replayEvent(timestamp: number): BrowserReplayEvent {
  return {
    type: EventType.Custom,
    data: {
      tag: 'test',
      payload: { timestamp },
    },
    timestamp,
  }
}

/**
 * Mirrors the in-page `__K6_DRAIN_EVENTS__` contract from replay.ts: batches are
 * retained until the k6 side acks them and merged into the next batch otherwise.
 */
function fakePage(pageId: string) {
  let closed = false
  let buffer: BrowserReplayEvent[] = []
  let retained: { id: number; events: BrowserReplayEvent[] } | null = null
  let nextBatchId = 0
  let delivery: Promise<void> | null = null

  function drain(received: Record<string, number>) {
    const acked = received[pageId]

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

    return `${pageId}\n${nextBatchId}\n${JSON.stringify(events)}`
  }

  // The k6 side hands the same map to every pull, so the state at call time has
  // to be copied to be asserted on.
  const acks: Array<Record<string, number>> = []

  return {
    acks,
    on: vi.fn(),
    isClosed: vi.fn(() => closed),
    goto: vi.fn(() => Promise.resolve()),
    reload: vi.fn(() => Promise.resolve()),
    waitForTimeout: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => {
      closed = true

      return Promise.resolve()
    }),
    evaluate: vi.fn(async function (
      _fn: unknown,
      received?: Record<string, number>
      // k6 turns an in-page `undefined` into null, which tests can mock in
    ): Promise<string | null | undefined> {
      // A call without an ack map is the page id probe
      if (received === undefined) {
        if (delivery !== null) {
          await delivery
        }

        return pageId
      }

      acks.push({ ...received })

      const payload = drain(received)

      if (delivery !== null) {
        await delivery
      }

      return payload
    }),

    emit(event: BrowserReplayEvent) {
      buffer.push(event)
    },

    /**
     * Holds back the delivery of every pull until the returned function is
     * called. The buffer is still cleared right away, like a slow CDP
     * round-trip would.
     */
    delayDelivery() {
      const gate = deferred<void>()

      delivery = gate.promise

      return () => {
        delivery = null
        gate.resolve()
      }
    },
  }
}

type FakePage = ReturnType<typeof fakePage>

function fakeContext(...pages: FakePage[]) {
  return {
    pages: vi.fn(() => pages),
    close: vi.fn(() => Promise.resolve()),
    addInitScript: vi.fn(() => Promise.resolve()),
    newPage: vi.fn(),
    waitForEvent: vi.fn(),
  }
}

type FakeContext = ReturnType<typeof fakeContext>

// Module state (context registry, ack map, outbox) leaks between tests, so
// every test gets its own copy of the module graph.
async function loadModules() {
  vi.resetModules()

  const http = (await import('k6/http')).default
  const asyncRequest = vi.spyOn(http, 'asyncRequest')

  const replayDrain = await import('./replayDrain')
  const { pageProxy } = await import('./proxies/page')
  const { createProxy } = await import('./utils')

  function postedBodies() {
    return asyncRequest.mock.calls
      .filter(
        ([, url]) => typeof url === 'string' && url.endsWith('/session-replay')
      )
      .map(([, , body]) => {
        if (typeof body !== 'string') {
          throw new Error('Expected the request body to be a string')
        }

        return body
      })
  }

  return {
    asyncRequest,
    postedBodies,

    postedEvents: () => {
      return postedBodies().flatMap((body) => {
        return (JSON.parse(body) as { events: BrowserReplayEvent[] }).events
      })
    },

    drainPage: (page: FakePage) => {
      return replayDrain.drainPage(page as unknown as Page)
    },

    drainReplayEvents: () => replayDrain.drainReplayEvents(),

    flushReplayEvents: () => replayDrain.flushReplayEvents(),

    register: (context: FakeContext) => {
      replayDrain.registerContext(context as unknown as BrowserContext)
    },

    proxyPage: (page: FakePage) => {
      return createProxy(pageProxy(page as unknown as Page))
    },
  }
}

let modules: Awaited<ReturnType<typeof loadModules>>

beforeEach(async () => {
  modules = await loadModules()
})

describe('drainPage', () => {
  it('posts pulled events before navigating away', async () => {
    const { proxyPage, postedEvents, postedBodies } = modules
    const page = fakePage('page-1')
    // The proxy replaces the page's own navigation methods
    const navigate = page.goto
    const proxied = proxyPage(page)
    const event = replayEvent(1)

    page.emit(event)

    await proxied.goto('https://example.com')

    await vi.waitFor(() => {
      expect(postedBodies()).toHaveLength(1)
    })

    expect(postedEvents()).toEqual([event])
    expect(page.evaluate.mock.invocationCallOrder[0]).toBeLessThan(
      navigate.mock.invocationCallOrder[0] ?? Infinity
    )
  })

  it('pulls again before a navigation that starts while a drain is in flight', async () => {
    const { register, proxyPage, drainReplayEvents, postedEvents } = modules
    const page = fakePage('page-1')

    register(fakeContext(page))

    const navigate = page.goto
    const proxied = proxyPage(page)
    const first = replayEvent(1)
    const second = replayEvent(2)

    page.emit(first)

    const deliver = page.delayDelivery()
    const inFlight = drainReplayEvents()

    page.emit(second)

    const navigation = proxied.goto('https://example.com')

    deliver()

    await inFlight
    await navigation

    await vi.waitFor(() => {
      expect(postedEvents()).toEqual([first, second])
    })

    // The pre-navigation drain must be its own pull, not a reused result, and
    // the events must not be duplicated by the two overlapping drains. Only
    // batch pulls count; page id probes carry no ack map.
    const pullsBeforeNavigation = page.evaluate.mock.invocationCallOrder.filter(
      (order, index) =>
        page.evaluate.mock.calls[index]?.[1] !== undefined &&
        order < (navigate.mock.invocationCallOrder[0] ?? Infinity)
    )

    expect(pullsBeforeNavigation).toHaveLength(2)
  })

  it('posts pulled events after a tracked action completes', async () => {
    const { register, proxyPage, postedBodies } = modules
    const page = fakePage('page-1')

    register(fakeContext(page))

    const proxied = proxyPage(page)

    page.emit(replayEvent(1))

    await proxied.waitForTimeout(1)

    await vi.waitFor(() => {
      expect(postedBodies()).toHaveLength(1)
    })
  })

  it('posts nothing when the page has no buffered events', async () => {
    const { proxyPage, postedBodies } = modules
    const page = fakePage('page-1')
    const proxied = proxyPage(page)

    await proxied.goto('https://example.com')
    await nextTick()

    expect(postedBodies()).toHaveLength(0)
  })

  it('posts nothing when the page returns a null payload', async () => {
    const { proxyPage, postedBodies } = modules
    const page = fakePage('page-1')

    // k6 marshals an in-page `undefined` evaluate result to null
    page.evaluate.mockResolvedValue(null)

    const proxied = proxyPage(page)

    page.emit(replayEvent(1))

    await proxied.goto('https://example.com')
    await nextTick()

    expect(postedBodies()).toHaveLength(0)
  })

  it('acks the last pulled batch on the next pull', async () => {
    const { proxyPage, drainPage } = modules
    const page = fakePage('page-1')
    const proxied = proxyPage(page)

    page.emit(replayEvent(1))

    await proxied.goto('https://example.com')

    page.emit(replayEvent(2))

    await drainPage(page)

    expect(page.acks).toEqual([{}, { 'page-1': 1 }])
  })

  it('runs the action even when the pull fails', async () => {
    const { proxyPage } = modules
    const page = fakePage('page-1')

    page.evaluate.mockRejectedValue(new Error('Execution context destroyed'))

    const navigate = page.goto
    const proxied = proxyPage(page)

    await expect(proxied.goto('https://example.com')).resolves.toBeUndefined()

    expect(navigate).toHaveBeenCalled()
  })
})

describe('drainReplayEvents', () => {
  it('drains popup pages that are only reachable through the context', async () => {
    const { register, drainReplayEvents, postedEvents } = modules
    const page = fakePage('page-1')
    const popup = fakePage('popup-1')
    const popupEvent = replayEvent(2)

    register(fakeContext(page, popup))

    page.emit(replayEvent(1))
    popup.emit(popupEvent)

    await drainReplayEvents()

    await vi.waitFor(() => {
      expect(postedEvents()).toContainEqual(popupEvent)
    })
  })

  it('pulls once per page when drains overlap across fresh page wrappers', async () => {
    const { register, drainReplayEvents, flushReplayEvents, postedEvents } =
      modules
    const page = fakePage('page-1')

    // k6's context.pages() returns a new Page wrapper on every call, so a
    // pull in flight cannot be recognized through the wrapper object. An
    // overlapping pull that isn't serialized is handed the same unacked
    // batch again, duplicating the events downstream.
    register({
      ...fakeContext(),
      pages: vi.fn(() => [
        {
          isClosed: () => page.isClosed(),
          evaluate: (fn: unknown, received?: Record<string, number>) =>
            page.evaluate(fn, received as Record<string, number>),
        },
      ]),
    } as unknown as FakeContext)

    const event = replayEvent(1)

    page.emit(event)

    const deliver = page.delayDelivery()

    const first = drainReplayEvents()
    const second = drainReplayEvents()

    deliver()

    await Promise.all([first, second])
    await flushReplayEvents()

    expect(postedEvents()).toEqual([event])
  })

  it('does not pull from a closed page', async () => {
    const { register, proxyPage, drainReplayEvents } = modules
    const page = fakePage('page-1')
    const closed = fakePage('page-2')

    register(fakeContext(page, closed))

    await proxyPage(closed).close()

    closed.evaluate.mockClear()

    page.emit(replayEvent(1))

    await drainReplayEvents()

    expect(closed.evaluate).not.toHaveBeenCalled()
  })

  it('does not let a wedged page block another page drain', async () => {
    const { register, proxyPage, drainReplayEvents, postedEvents } = modules
    const page = fakePage('page-1')
    const wedged = fakePage('page-2')
    const event = replayEvent(1)

    register(fakeContext(page, wedged))

    // Never released: the page's JS thread is stuck
    wedged.delayDelivery()
    wedged.emit(replayEvent(2))

    void drainReplayEvents()

    page.emit(event)

    await proxyPage(page).goto('https://example.com')

    await vi.waitFor(() => {
      expect(postedEvents()).toEqual([event])
    })
  })

  it('prunes contexts that have been closed', async () => {
    const { register, drainReplayEvents } = modules
    const page = fakePage('page-1')
    const context = fakeContext(page)

    context.pages.mockImplementation(() => {
      throw new Error('context is closed')
    })

    register(context)

    await drainReplayEvents()
    await drainReplayEvents()

    expect(context.pages).toHaveBeenCalledTimes(1)
  })
})

describe('the outbox', () => {
  it('keeps a rejected body and retries it on the next drain', async () => {
    const { register, drainPage, asyncRequest, postedEvents } = modules
    const page = fakePage('page-1')
    const first = replayEvent(1)
    const second = replayEvent(2)

    register(fakeContext(page))

    asyncRequest.mockResolvedValueOnce(httpResponse(500))

    page.emit(first)

    await drainPage(page)
    await nextTick()

    page.emit(second)

    await drainPage(page)

    // The rejected body is sent again, so nothing recorded is lost
    await vi.waitFor(() => {
      expect(postedEvents()).toEqual([first, first, second])
    })
  })

  it('posts bodies in pull order even when the first post is slow', async () => {
    const { drainPage, asyncRequest, postedBodies, postedEvents } = modules
    const page = fakePage('page-1')
    const first = replayEvent(1)
    const second = replayEvent(2)
    const slowPost = deferred<void>()

    asyncRequest.mockImplementationOnce(() => {
      return slowPost.promise.then(() => httpResponse(200))
    })

    page.emit(first)

    await drainPage(page)

    page.emit(second)

    await drainPage(page)
    await nextTick()

    // The second body must wait for the first one to be accepted
    expect(postedBodies()).toHaveLength(1)

    slowPost.resolve()

    await vi.waitFor(() => {
      expect(postedBodies()).toHaveLength(2)
    })

    expect(postedEvents()).toEqual([first, second])
  })

  it('restarts after a synchronous failure of the post', async () => {
    const { drainPage, asyncRequest, postedEvents } = modules
    const page = fakePage('page-1')
    const event = replayEvent(1)

    asyncRequest.mockImplementationOnce(() => {
      throw new Error('dial tcp: connection refused')
    })

    page.emit(event)

    await drainPage(page)
    await nextTick()

    page.emit(replayEvent(2))

    await drainPage(page)

    await vi.waitFor(() => {
      expect(postedEvents()).toContainEqual(event)
    })
  })

  it('drops the oldest bodies once it is full', async () => {
    const { drainPage, asyncRequest, postedBodies, flushReplayEvents } = modules
    const page = fakePage('page-1')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    asyncRequest.mockResolvedValue(httpResponse(500))

    for (let index = 0; index < 101; index++) {
      page.emit(replayEvent(index))

      await drainPage(page)
    }

    await nextTick()

    const rejected = postedBodies().length

    asyncRequest.mockResolvedValue(httpResponse(200))

    await flushReplayEvents()

    expect(postedBodies().length - rejected).toBe(100)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('stays full when a rejected body comes back to a full outbox', async () => {
    const { drainPage, asyncRequest, postedBodies, flushReplayEvents } = modules
    const page = fakePage('page-1')
    const heldPost = deferred<void>()

    vi.spyOn(console, 'warn').mockImplementation(() => {})

    // The first post is still in flight while the outbox fills up, so the
    // rejected body lands on top of an already full outbox.
    asyncRequest.mockImplementation(() => {
      return heldPost.promise.then(() => httpResponse(500))
    })

    async function fill(batches: number) {
      for (let index = 0; index < batches; index++) {
        page.emit(replayEvent(index))

        await drainPage(page)
        await nextTick()
      }
    }

    await fill(101)

    asyncRequest.mockResolvedValue(httpResponse(500))
    heldPost.resolve()

    await nextTick()
    await fill(5)

    const rejected = postedBodies().length

    asyncRequest.mockResolvedValue(httpResponse(200))

    await flushReplayEvents()

    // One body over the limit: the one that was in flight when it filled up
    expect(postedBodies().length - rejected).toBeLessThanOrEqual(101)
  })
})

describe('flushReplayEvents', () => {
  it('waits for the tail to be delivered', async () => {
    const {
      register,
      drainPage,
      asyncRequest,
      flushReplayEvents,
      postedEvents,
    } = modules
    const page = fakePage('page-1')
    const event = replayEvent(1)
    const slowPost = deferred<void>()

    register(fakeContext(page))

    asyncRequest.mockImplementationOnce(() => {
      return slowPost.promise.then(() => httpResponse(200))
    })

    page.emit(event)

    await drainPage(page)

    let delivered = false

    const flush = flushReplayEvents().then(() => {
      delivered = true
    })

    await nextTick()

    // The iteration must not end before the tracking server has the tail
    expect(delivered).toBe(false)

    slowPost.resolve()

    await flush

    expect(postedEvents()).toEqual([event])
  })

  it('gives up on a wedged page instead of hanging', async () => {
    const { register, flushReplayEvents } = modules
    const page = fakePage('page-1')

    register(fakeContext(page))

    page.delayDelivery()
    page.emit(replayEvent(1))

    vi.useFakeTimers()

    const flush = flushReplayEvents()

    await vi.advanceTimersByTimeAsync(3000)

    await expect(flush).resolves.toBeUndefined()

    vi.useRealTimers()
  })
})

describe('browser context instrumentation', () => {
  it('delivers the tail when the context is closed', async () => {
    const { postedEvents } = modules
    const page = fakePage('page-1')
    const context = fakeContext(page)
    const event = replayEvent(1)

    const { browser } = await import('k6/browser')

    vi.spyOn(browser, 'newContext').mockResolvedValue(
      context as unknown as BrowserContext
    )

    // The shim replaces the context's own close method
    const nativeClose = context.close

    await import('./index')

    const proxied = await browser.newContext()

    page.emit(event)

    await proxied.close()

    expect(postedEvents()).toEqual([event])
    expect(nativeClose).toHaveBeenCalled()
  })
})
