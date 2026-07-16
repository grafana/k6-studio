import { afterEach, describe, expect, it } from 'vitest'

import { serializeElementChain } from '@/recorder/browser/serialization'
import { cssLocatorOptions } from '@/schemas/locator'
import { BrowserEventTarget } from '@/schemas/recording'

import {
  expandRemoteTrackedElement,
  getBounds,
  getRoles,
  getTarget,
  toRemoteFrames,
  toRemoteTrackedElement,
  toTrackedElement,
} from './utils'

const frameTarget = (css: string): BrowserEventTarget => ({
  selectors: { css },
})

const scrollDescriptors = ['scrollX', 'scrollY'].map(
  (property) =>
    [property, Object.getOwnPropertyDescriptor(window, property)] as const
)

function setScroll(x: number, y: number) {
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true })
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
}

afterEach(() => {
  document.body.innerHTML = ''

  scrollDescriptors.forEach(([property, descriptor]) => {
    if (descriptor !== undefined) {
      Object.defineProperty(window, property, descriptor)
    }
  })
})

describe('toTrackedElement', () => {
  it('marks the returned element as live', () => {
    const div = document.createElement('div')
    document.body.append(div)

    expect(toTrackedElement(div).kind).toBe('live')
  })
})

describe('toRemoteTrackedElement', () => {
  it('finalizes bounds from the payload bounds, the relay offset, and the top scroll', () => {
    setScroll(1, 2)

    const div = document.createElement('div')
    div.getBoundingClientRect = () =>
      ({ top: 100, left: 50, width: 30, height: 40 }) as DOMRect
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, { left: 5, top: 7 })

    expect(remote.bounds).toEqual({
      top: 100 + 7 + 2,
      left: 50 + 5 + 1,
      width: 30,
      height: 40,
    })
  })

  it('keeps kind, state, ancestors, and framePath as given', () => {
    setScroll(0, 0)

    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const framePath = [frameTarget('iframe#a')]
    const remote = toRemoteTrackedElement(state, [state], framePath, {
      left: 0,
      top: 0,
    })

    expect(remote.kind).toBe('remote')
    expect(remote.state).toBe(state)
    expect(remote.ancestors).toEqual([state])
    expect(remote.framePath).toBe(framePath)
  })
})

describe('expandRemoteTrackedElement', () => {
  it('returns undefined when there are no ancestors left', () => {
    document.body.innerHTML = '<div id="inner"></div>'

    const inner = document.querySelector('#inner')

    if (inner === null) {
      throw new Error('inner not found')
    }

    const [state] = serializeElementChain(inner)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const head = toRemoteTrackedElement(state, [], null, { left: 0, top: 0 })

    expect(expandRemoteTrackedElement(head)).toBeUndefined()
  })

  it('walks the ancestor chain, keeping the same offset from each state', () => {
    document.body.innerHTML =
      '<div id="outer"><div id="middle"><div id="inner"></div></div></div>'

    const inner = document.querySelector('#inner')

    if (inner === null) {
      throw new Error('inner not found')
    }

    inner.getBoundingClientRect = () =>
      ({ top: 10, left: 10, width: 5, height: 5 }) as DOMRect

    const middle = document.querySelector('#middle')

    if (middle === null) {
      throw new Error('middle not found')
    }

    middle.getBoundingClientRect = () =>
      ({ top: 0, left: 0, width: 50, height: 50 }) as DOMRect

    const chain = serializeElementChain(inner)
    const [innerState, middleState] = chain

    if (innerState === undefined || middleState === undefined) {
      throw new Error('expected inner and middle states')
    }

    const head = toRemoteTrackedElement(innerState, chain.slice(1), null, {
      left: 3,
      top: 4,
    })

    const expanded = expandRemoteTrackedElement(head)

    if (expanded === undefined) {
      throw new Error('expected expansion to succeed')
    }

    expect(expanded.kind).toBe('remote')
    expect(expanded.state).toBe(middleState)
    expect(expanded.ancestors).toEqual(chain.slice(2))
    expect(expanded.framePath).toBe(head.framePath)

    // The delta between a head's bounds and its own state bounds stays
    // constant across the chain, since every ancestor lives in the same
    // originating frame and was captured at the same top scroll position.
    const delta = {
      left: head.bounds.left - head.state.bounds.left,
      top: head.bounds.top - head.state.bounds.top,
    }

    expect(expanded.bounds).toEqual({
      left: middleState.bounds.left + delta.left,
      top: middleState.bounds.top + delta.top,
      width: middleState.bounds.width,
      height: middleState.bounds.height,
    })
  })
})

describe('getTarget, getRoles, getBounds', () => {
  it('read from the live element for a live tracked element', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const live = toTrackedElement(div)

    expect(getTarget(live)).toBe(live.target)
    expect(getRoles(live)).toBe(live.roles)
    expect(getBounds(live)).toBe(live.bounds)
  })

  it('read from the serialized state for a remote tracked element', () => {
    const div = document.createElement('div')
    document.body.append(div)

    const [state] = serializeElementChain(div)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    expect(getTarget(remote)).toBe(state.target)
    expect(getRoles(remote)).toBe(state.roles)
    expect(getBounds(remote)).toBe(remote.bounds)
  })
})

describe('toRemoteFrames', () => {
  it('maps a null frame path to undefined', () => {
    expect(toRemoteFrames(null)).toBeUndefined()
  })

  it('maps an empty frame path to undefined', () => {
    expect(toRemoteFrames([])).toBeUndefined()
  })

  it('maps a frame path to css locator options, one per frame', () => {
    const framePath = [frameTarget('iframe#a'), frameTarget('iframe#b')]

    expect(toRemoteFrames(framePath)).toEqual([
      cssLocatorOptions('iframe#a'),
      cssLocatorOptions('iframe#b'),
    ])
  })
})
