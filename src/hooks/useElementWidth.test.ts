import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useElementWidth } from './useElementWidth'

let resizeCallback: ResizeObserverCallback | undefined

class ResizeObserverMock {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

function createRef(clientWidth: number) {
  return {
    current: { clientWidth } as HTMLElement,
  }
}

describe('useElementWidth', () => {
  beforeEach(() => {
    resizeCallback = undefined
  })

  it('returns null while there is nothing to measure', () => {
    const ref = { current: null }

    const { result } = renderHook(() => useElementWidth(ref))

    expect(result.current).toBeNull()
  })

  it('returns the element width on mount', () => {
    const ref = createRef(640)

    const { result } = renderHook(() => useElementWidth(ref))

    expect(result.current).toBe(640)
  })

  it('updates when the element resizes', () => {
    const ref = createRef(640)

    const { result } = renderHook(() => useElementWidth(ref))

    Object.defineProperty(ref.current, 'clientWidth', {
      value: 0,
      configurable: true,
    })
    act(() => {
      resizeCallback?.([], new ResizeObserverMock(() => {}))
    })

    expect(result.current).toBe(0)
  })
})
