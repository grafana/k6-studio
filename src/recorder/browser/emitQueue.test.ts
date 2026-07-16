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

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('createSequentialEmitter', () => {
  it('attaches the resolved frame path to every event', async () => {
    const frames: BrowserEventTarget[] = [
      { selectors: { css: 'iframe#outer' } },
    ]
    const sent: BrowserEvent[][] = []

    const { emit } = createSequentialEmitter(
      () => Promise.resolve(frames),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))

    await flushMicrotasks()

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

    const { emit } = createSequentialEmitter(
      () => paths.shift() ?? Promise.resolve([]),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    await flushMicrotasks()

    expect(sent).toEqual([])

    resolveFirst([])

    await flushMicrotasks()

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

    const { emit } = createSequentialEmitter(
      () => paths.shift() ?? Promise.resolve([]),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    await flushMicrotasks()

    expect(sent.flat().map((event) => event.eventId)).toEqual([
      'first',
      'second',
    ])
  })

  it('keeps emitting after send throws', async () => {
    const sent: BrowserEvent[][] = []
    let shouldThrow = true

    const { emit } = createSequentialEmitter(
      () => Promise.resolve([]),
      (events) => {
        if (shouldThrow) {
          shouldThrow = false
          throw new Error('transport down')
        }

        sent.push(events)
      }
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    await flushMicrotasks()

    expect(sent.flat().map((event) => event.eventId)).toEqual(['second'])
  })

  it('flushes queued events immediately without waiting for the frame path', () => {
    const sent: BrowserEvent[][] = []

    const { emit, flush } = createSequentialEmitter(
      () => new Promise<BrowserEventTarget[]>(() => undefined),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    emit(makeEvent('second'))

    flush()

    expect(sent.flat()).toEqual([makeEvent('first'), makeEvent('second')])
  })

  it('does not send a batch again when its delayed path resolves after a flush', async () => {
    const sent: BrowserEvent[][] = []
    let resolvePath: (path: BrowserEventTarget[]) => void = () => undefined

    const { emit, flush } = createSequentialEmitter(
      () =>
        new Promise<BrowserEventTarget[]>((resolve) => {
          resolvePath = resolve
        }),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))

    flush()

    expect(sent).toEqual([[makeEvent('first')]])

    resolvePath([])

    await flushMicrotasks()

    expect(sent).toEqual([[makeEvent('first')]])
  })

  it('still emits normally after a flush', async () => {
    const sent: BrowserEvent[][] = []

    const { emit, flush } = createSequentialEmitter(
      () => Promise.resolve([]),
      (events) => sent.push(events)
    )

    emit(makeEvent('first'))
    flush()

    emit(makeEvent('second'))

    await flushMicrotasks()

    expect(sent).toEqual([[makeEvent('first')], [makeEvent('second')]])
  })
})
