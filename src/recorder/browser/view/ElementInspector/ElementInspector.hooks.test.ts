import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  FrameAgent,
  installFrameAgent,
} from '@/recorder/browser/messaging/frames'
import { serializeElementChain } from '@/recorder/browser/serialization'

import { useInspectedElement } from './ElementInspector.hooks'

afterEach(() => {
  document.body.innerHTML = ''
  installFrameAgent(null)
})

function installPickListener() {
  let onElementPick: ((payload: unknown) => void) | undefined

  installFrameAgent({
    onElementPick: (listener: (payload: unknown) => void) => {
      onElementPick = listener

      return () => {}
    },
  } as unknown as FrameAgent)

  return () => {
    if (onElementPick === undefined) {
      throw new Error('expected useInspectedElement to subscribe')
    }

    return onElementPick
  }
}

describe('useInspectedElement remote picks', () => {
  it('pins a remote element from a payload relayed over the frame agent', () => {
    const getPickListener = installPickListener()

    document.body.innerHTML = '<input type="checkbox" id="checkbox" checked />'
    const checkbox = document.querySelector('#checkbox')

    if (checkbox === null) {
      throw new Error('expected #checkbox element')
    }

    checkbox.getBoundingClientRect = () =>
      ({ top: 0, left: 0, width: 100, height: 100 }) as DOMRect

    const [state] = serializeElementChain(checkbox)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const { result } = renderHook(() => useInspectedElement())

    act(() => {
      getPickListener()({
        elements: [state],
        associatedControl: state,
        framePath: null,
        position: { left: 10, top: 10 },
        offset: { left: 0, top: 0 },
      })
    })

    expect(result.current.pinned?.kind).toBe('remote')
    expect(result.current.element?.kind).toBe('remote')
    expect(result.current.mousePosition).toEqual({ left: 10, top: 10 })

    if (result.current.pinned?.kind !== 'remote') {
      throw new Error('expected a remote pinned element')
    }

    expect(result.current.pinned.associatedControl).toBe(state)
  })

  it('ignores a pick outside the picked element bounds', () => {
    const getPickListener = installPickListener()

    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    target.getBoundingClientRect = () =>
      ({ top: 0, left: 0, width: 10, height: 10 }) as DOMRect

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const { result } = renderHook(() => useInspectedElement())

    act(() => {
      getPickListener()({
        elements: [state],
        associatedControl: null,
        framePath: null,
        position: { left: 1000, top: 1000 },
        offset: { left: 0, top: 0 },
      })
    })

    expect(result.current.pinned).toBeNull()
  })

  it('resets instead of pinning a new remote element when one is already pinned', () => {
    const getPickListener = installPickListener()

    document.body.innerHTML = '<div id="target"></div>'
    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('expected #target element')
    }

    target.getBoundingClientRect = () =>
      ({ top: 0, left: 0, width: 100, height: 100 }) as DOMRect

    const [state] = serializeElementChain(target)

    if (state === undefined) {
      throw new Error('expected a serialized state')
    }

    const { result } = renderHook(() => useInspectedElement())

    const payload = {
      elements: [state],
      associatedControl: null,
      framePath: null,
      position: { left: 10, top: 10 },
      offset: { left: 0, top: 0 },
    }

    act(() => {
      getPickListener()(payload)
    })

    expect(result.current.pinned).not.toBeNull()

    act(() => {
      getPickListener()(payload)
    })

    expect(result.current.pinned).toBeNull()
  })
})
