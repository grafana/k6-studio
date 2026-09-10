import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'
import {
  createProxyDataWithoutResponse,
  createRequest,
} from '@/test/factories/proxyData'
import { safeBtoa } from '@/utils/format'

import { proxyDataToHar } from './proxyDataToHar'

function clickAt(timestamp: number, id: string): BrowserEvent {
  return {
    type: 'click',
    eventId: id,
    timestamp,
    tab: 'tab-1',
    target: { selectors: { css: `#${id}` } },
    button: 'left',
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
  }
}

function eventIds(recording: ReturnType<typeof proxyDataToHar>): string[] {
  return (recording.log._browserEvents?.events ?? []).map(
    (event) => event.eventId
  )
}

describe('proxyDataToHar browser events', () => {
  it('sorts recorded events by timestamp', () => {
    // Events arrive over separate per-frame sockets, so they can be appended
    // out of order.
    const events = [clickAt(30, 'c'), clickAt(10, 'a'), clickAt(20, 'b')]

    expect(eventIds(proxyDataToHar([], events))).toEqual(['a', 'b', 'c'])
  })

  it('keeps insertion order for events with equal timestamps', () => {
    const events = [clickAt(10, 'a'), clickAt(10, 'b'), clickAt(10, 'c')]

    expect(eventIds(proxyDataToHar([], events))).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input array', () => {
    const events = [clickAt(30, 'c'), clickAt(10, 'a')]

    proxyDataToHar([], events)

    expect(events.map((event) => event.eventId)).toEqual(['c', 'a'])
  })
})

describe('proxyDataToHar', () => {
  it('preserves binary request payloads', () => {
    const binaryContent = String.fromCharCode(
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a
    )

    const proxyData = createProxyDataWithoutResponse({
      request: createRequest({
        method: 'POST',
        headers: [['content-type', 'application/octet-stream']],
        content: btoa(binaryContent),
      }),
    })

    const recording = proxyDataToHar([proxyData], [])
    const text = recording.log.entries?.[0]?.request.postData?.text

    expect(text).toBeDefined()
    expect(Array.from(text!, (char) => char.charCodeAt(0))).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ])
  })

  it('preserves Unicode characters in request payloads', () => {
    const original = JSON.stringify({
      name: 'Nguyễn Văn A',
      message: 'kiểm thử tiếng Việt',
      cyrillic: 'Привет мир',
      emoji: '✅ café',
    })

    const proxyData = createProxyDataWithoutResponse({
      request: createRequest({
        method: 'POST',
        headers: [['content-type', 'application/json; charset=utf-8']],
        content: safeBtoa(original),
      }),
    })

    const har = proxyDataToHar([proxyData], [])

    const entry = har.log.entries?.[0]

    expect(entry).toBeDefined()
    expect(entry?.request.postData?.text).toBe(original)
  })
})
