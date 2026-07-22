import { renderHook, act } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import { useListenBrowserEvent } from './useListenBrowserEvent'

type Callback = (events: BrowserEvent[]) => void

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

describe('useListenBrowserEvent', () => {
  let emit: Callback

  beforeAll(() => {
    vi.stubGlobal('studio', {
      browser: {
        onBrowserEvent: (callback: Callback) => {
          emit = callback

          return () => {}
        },
      },
    })
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  // The session broadcasts its full, timestamp-sorted buffer on every record:
  // frames stream over separate sockets, so a late one carries an earlier
  // event and the buffer is re-sorted. The hook must mirror that snapshot, not
  // append each batch, or the live event list shows iframe interactions out of
  // order.
  it('mirrors the latest sorted snapshot instead of accumulating batches', () => {
    const { result } = renderHook(() => useListenBrowserEvent())

    act(() => {
      emit([nav('b', 2)])
      emit([nav('a', 1), nav('b', 2)])
    })

    expect(result.current.map((event) => event.eventId)).toEqual(['a', 'b'])
  })
})
