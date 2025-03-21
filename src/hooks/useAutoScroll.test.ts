import { renderHook } from '@testing-library/react'
import React, { useRef } from 'react'
import { describe, expect, it, vi, afterAll } from 'vitest'

import { useAutoScroll } from './useAutoScroll'

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react')
  return {
    ...actual,
    useRef: vi.fn(),
  }
})

describe('useAutoScroll', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })

  it('should call scrollIntoView when items change and enabled is true', () => {
    const scrollIntoViewMock = vi.fn()
    const bottomRef = { current: { scrollIntoView: scrollIntoViewMock } }
    vi.mocked(useRef).mockImplementation(() => bottomRef)

    const { rerender } = renderHook(
      ({ items }: { items: number[] }) => useAutoScroll(items, true),
      {
        initialProps: { items: [] as number[] },
      }
    )

    rerender({ items: [1] })

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'end',
    })
  })

  it('should not call scrollIntoView when enabled is false', () => {
    const scrollIntoViewMock = vi.fn()
    const bottomRef = { current: { scrollIntoView: scrollIntoViewMock } }
    vi.mocked(useRef).mockImplementation(() => bottomRef)

    const { rerender } = renderHook(
      ({ items, enabled }: { items: number[]; enabled: boolean }) =>
        useAutoScroll(items, enabled),
      {
        initialProps: { items: [] as number[], enabled: false },
      }
    )

    rerender({ items: [1], enabled: false })

    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })
})
