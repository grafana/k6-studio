import { describe, expect, it } from 'vitest'

import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'

import { createSequentialEmitter } from './emitQueue'

const makeEvent = (eventId: string): BrowserEvent => ({
  type: 'navigate-to-page',
  eventId,
  timestamp: 1,
  tab: 'tab-1',
  url: 'http://example.test',
  source: 'address-bar',
})

describe('createSequentialEmitter', () => {
  it('attaches the resolved frame path to every event', async () => {
    const frames: BrowserEventTarget[] = [
      { selectors: { css: 'iframe#outer' } },
    ]
    const sent: BrowserEvent[][] = []

    const emit = createSequentialEmitter(
      () => Promise.resolve(frames),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(sent).toEqual([[{ ...makeEvent('first'), frames }]])
  })

  it('preserves emission order when earlier paths resolve slower', async () => {
    const sent: BrowserEvent[][] = []
    let resolveFirst: (path: BrowserEventTarget[]) => void = () => undefined

    const paths = [
      new Promise<BrowserEventTarget[]>((resolve) => {
        resolveFirst = resolve
      }),
      Promise.resolve<BrowserEventTarget[]>([]),
    ]

    const emit = createSequentialEmitter(
      () => paths.shift() ?? Promise.resolve([]),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(sent).toEqual([])

    resolveFirst([])

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(sent.flat().map((event) => event.eventId)).toEqual([
      'first',
      'second',
    ])
  })

  it('keeps emitting after a path lookup rejects', async () => {
    const sent: BrowserEvent[][] = []

    const paths = [
      Promise.reject<BrowserEventTarget[]>(new Error('boom')),
      Promise.resolve<BrowserEventTarget[]>([]),
    ]

    const emit = createSequentialEmitter(
      () => paths.shift() ?? Promise.resolve([]),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(sent.flat().map((event) => event.eventId)).toEqual([
      'first',
      'second',
    ])
  })
})
