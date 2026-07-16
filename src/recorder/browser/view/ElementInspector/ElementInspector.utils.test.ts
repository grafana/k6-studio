import { afterEach, describe, expect, it } from 'vitest'

import { serializeElementChain } from '@/recorder/browser/serialization'
import { getElementDetails } from '@/utils/dom/selectors'

import { getFramesForElement } from './ElementInspector.utils'
import { toRemoteTrackedElement, toTrackedElement } from './utils'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('getFramesForElement', () => {
  it('returns an empty path when there is no element', () => {
    expect(getFramesForElement(null)).toEqual([])
  })

  it('returns an empty path for a live element in the top frame', () => {
    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    expect(getFramesForElement(toTrackedElement(target))).toEqual([])
  })

  it('walks the owning iframe chain for a live element inside an iframe', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'child-frame'
    document.body.append(iframe)

    const doc = iframe.contentDocument

    if (doc === null) {
      throw new Error('iframe has no contentDocument')
    }

    const inner = doc.createElement('div')
    doc.body.append(inner)

    expect(getFramesForElement(toTrackedElement(inner))).toEqual([
      getElementDetails(iframe),
    ])
  })

  it('returns the relayed frame path for a remote element', () => {
    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const framePath = [{ selectors: { css: 'iframe#a' } }]
    const remote = toRemoteTrackedElement(state, [], framePath, {
      left: 0,
      top: 0,
    })

    expect(getFramesForElement(remote)).toBe(framePath)
  })

  it('returns an empty path for a remote element with an unresolved frame path', () => {
    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const remote = toRemoteTrackedElement(state, [], null, {
      left: 0,
      top: 0,
    })

    expect(getFramesForElement(remote)).toEqual([])
  })
})
