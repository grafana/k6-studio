import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOverflowCheck } from './useOverflowCheck'

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

function setValueOnRef(
  ref: React.RefObject<HTMLElement>,
  key: string,
  value: number
) {
  Object.defineProperty(ref.current, key, { value, configurable: true })
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

describe('useOverflowCheck', () => {
  let ref: React.RefObject<HTMLElement>

  beforeEach(() => {
    ref = {
      current: {
        scrollWidth: 0,
        clientWidth: 0,
      } as HTMLElement,
    }
  })

  it('should return true when element has overflow', () => {
    setValueOnRef(ref, 'scrollWidth', 200)
    setValueOnRef(ref, 'clientWidth', 100)

    const { result } = renderHook(() => useOverflowCheck(ref))

    expect(result.current).toBe(true)
  })

  it('should return false when element does not have overflow', () => {
    setValueOnRef(ref, 'scrollWidth', 100)
    setValueOnRef(ref, 'clientWidth', 200)

    const { result } = renderHook(() => useOverflowCheck(ref))

    expect(result.current).toBe(false)
  })
})
