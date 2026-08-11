import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'
import {
  createClickEvent,
  createInputChangeEvent,
  createNavigateToPageEvent,
} from '@/test/factories/browserEvents'
import {
  createProxyData,
  createProxyDataWithoutResponse,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'
import { ProxyData } from '@/types'

import { detectWaits } from './waits'

// Events carry epoch milliseconds and requests epoch seconds, so all fixtures
// hang off a base that is round in both units.
const BASE_MS = 1_000_000
const ORIGIN_HOST = 'shop.example.test'

function navigate(
  eventId: string,
  offsetMs: number,
  url = `https://${ORIGIN_HOST}/`,
  tab = 'tab1'
): BrowserEvent {
  return createNavigateToPageEvent({
    eventId,
    timestamp: BASE_MS + offsetMs,
    url,
    tab,
  })
}

function click(eventId: string, offsetMs: number, tab = 'tab1'): BrowserEvent {
  return createClickEvent({ eventId, timestamp: BASE_MS + offsetMs, tab })
}

function inputChange(
  eventId: string,
  offsetMs: number,
  tab = 'tab1'
): BrowserEvent {
  return createInputChangeEvent({ eventId, timestamp: BASE_MS + offsetMs, tab })
}

interface RequestOptions {
  startMs: number
  durationMs: number
  host?: string
  contentType?: string
  method?: 'GET' | 'POST'
}

function apiRequest({
  startMs,
  durationMs,
  host = ORIGIN_HOST,
  contentType = 'application/json',
  method = 'GET',
}: RequestOptions): ProxyData {
  const timestampStart = (BASE_MS + startMs) / 1000

  return createProxyData({
    request: createRequest({
      host,
      method,
      url: `https://${host}/data`,
      timestampStart,
      timestampEnd: timestampStart + durationMs / 1000,
    }),
    response: createResponse({ headers: [['Content-Type', contentType]] }),
  })
}

describe('detectWaits', () => {
  it('returns no waits without events', () => {
    expect(
      detectWaits([], [apiRequest({ startMs: 0, durationMs: 1000 })])
    ).toEqual(new Map())
  })

  it('returns no waits without requests', () => {
    expect(detectWaits([navigate('1', 0), click('2', 1000)], [])).toEqual(
      new Map()
    )
  })

  it('returns no waits when the journey has no navigation to derive an origin from', () => {
    const events = [click('1', 1000), click('2', 4000)]

    expect(
      detectWaits(events, [apiRequest({ startMs: 1000, durationMs: 1000 })])
    ).toEqual(new Map())
  })

  it('takes the origin from the first navigation that can be replayed', () => {
    const events = [
      navigate('newTab', -1000, 'chrome://new-tab-page/'),
      navigate('nav', 0),
      click('a', 1000),
      click('b', 4000),
    ]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('inserts a wait before an action that would race a request the recording waited out', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    // Replay: nav at 0, click a at 100, so the request finishes at 1100 while
    // the clock stands at 200 before click b: 900 remaining, 900 * 2 + 500.
    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('attributes a request that started while the user was still typing to the input event', () => {
    const events = [
      navigate('nav', 0),
      inputChange('input', 2000),
      click('b', 5000),
    ]
    const requests = [apiRequest({ startMs: 500, durationMs: 1500 })]

    // Attributed to the input with offset 0, so it finishes at 100 + 1500 while
    // the clock stands at 200 before click b: 1400 remaining. Attributing it to
    // the preceding navigation instead would also insert a wait before `input`.
    expect(detectWaits(events, requests)).toEqual(new Map([['b', 3300]]))
  })

  it('keeps attribution on the preceding click when a value input follows later', () => {
    // The request belongs to click a; a value input typed seconds later must
    // not steal it, or click b would lose the wait protecting the race.
    const events = [
      navigate('nav', 0),
      click('a', 1000),
      click('b', 4000),
      inputChange('input', 6000),
    ]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('ignores a request that never completed before the next action in the recording', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 1500)]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('ignores a request that started too long after any action to be its result', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 7000)]
    const requests = [apiRequest({ startMs: 5000, durationMs: 500 })]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('never inserts a wait before a navigation', () => {
    const events = [
      navigate('nav', 0),
      click('a', 1000),
      navigate('nav2', 4000),
    ]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('ignores non-GET requests to a third-party domain', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [
      apiRequest({
        startMs: 1000,
        durationMs: 1000,
        host: 'api.other.test',
        method: 'POST',
      }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('counts GET requests to a third-party domain', () => {
    // Pages call their backends on other registrable domains; only the
    // POSTing telemetry beacons are dropped by the cross-site filter.
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [
      apiRequest({ startMs: 1000, durationMs: 1000, host: 'api.other.test' }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('counts non-GET requests on the origin domain', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [
      apiRequest({ startMs: 1000, durationMs: 1000, method: 'POST' }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('counts requests to a subdomain of the origin domain', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [
      apiRequest({
        startMs: 1000,
        durationMs: 1000,
        host: `api.${ORIGIN_HOST}`,
      }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map([['b', 2300]]))
  })

  it('treats only the exact host as same-site when the origin has no registrable domain', () => {
    const events = [
      navigate('nav', 0, 'http://localhost:3000/'),
      click('a', 1000),
      click('b', 4000),
    ]

    expect(
      detectWaits(events, [
        apiRequest({
          startMs: 1000,
          durationMs: 1000,
          host: 'localhost',
          method: 'POST',
        }),
      ])
    ).toEqual(new Map([['b', 2300]]))

    expect(
      detectWaits(events, [
        apiRequest({
          startMs: 1000,
          durationMs: 1000,
          host: '127.0.0.1',
          method: 'POST',
        }),
      ])
    ).toEqual(new Map())
  })

  it('ignores requests that did not return json', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [
      apiRequest({
        startMs: 1000,
        durationMs: 1000,
        contentType: 'text/html; charset=utf-8',
      }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('ignores requests that never got a response', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const timestampStart = (BASE_MS + 1000) / 1000
    const requests = [
      createProxyDataWithoutResponse({
        request: createRequest({
          host: ORIGIN_HOST,
          url: `https://${ORIGIN_HOST}/data`,
          timestampStart,
          timestampEnd: timestampStart + 1,
        }),
      }),
    ]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('ignores requests whose duration cannot be derived', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 4000)]
    const requests = [apiRequest({ startMs: 1000, durationMs: 0 })]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })

  it('caps the wait at five seconds', () => {
    const events = [navigate('nav', 0), click('a', 1000), click('b', 7000)]
    const requests = [apiRequest({ startMs: 1000, durationMs: 5000 })]

    // 4900 remaining would ask for 10300ms.
    expect(detectWaits(events, requests)).toEqual(new Map([['b', 5000]]))
  })

  it('keeps tab timelines separate', () => {
    // The request belongs to tab1's click. Tab2's click is only slow in the
    // recording because the user switched tabs, and a single shared timeline
    // would wrongly make it wait for tab1's request.
    const events = [
      navigate('nav', 0),
      click('a', 1000),
      click('b', 4000, 'tab2'),
    ]
    const requests = [apiRequest({ startMs: 1000, durationMs: 1000 })]

    expect(detectWaits(events, requests)).toEqual(new Map())
  })
})
