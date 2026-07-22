import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

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
