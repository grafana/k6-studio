import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import { mergeRecordedEvents } from './events'

function nav(eventId: string, timestamp: number): BrowserEvent {
  return {
    type: 'navigate-to-page',
    eventId,
    timestamp,
    tab: 'tab-1',
    url: 'http://example.test',
    source: 'address-bar',
  }
}

describe('mergeRecordedEvents', () => {
  it('orders late-arriving events from another frame by timestamp', () => {
    const existing = [nav('a', 100), nav('b', 300)]
    // An iframe's socket flushes a buffered event with an earlier timestamp.
    const incoming = [nav('c', 200)]

    const merged = mergeRecordedEvents(existing, incoming)

    expect(merged.map((event) => event.eventId)).toEqual(['a', 'c', 'b'])
  })

  it('keeps arrival order for events sharing a timestamp', () => {
    const merged = mergeRecordedEvents(
      [nav('a', 100)],
      [nav('b', 100), nav('c', 100)]
    )

    expect(merged.map((event) => event.eventId)).toEqual(['a', 'b', 'c'])
  })

  it('handles an empty buffer', () => {
    const merged = mergeRecordedEvents([], [nav('a', 5)])

    expect(merged.map((event) => event.eventId)).toEqual(['a'])
  })
})
