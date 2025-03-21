import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockMatchMedia } from '@/test/utils/mockMatchMedia'

import { useTheme } from './useTheme'

describe('useTheme', () => {
  it('should return "light" when the media query does not match', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current).toBe('light')
  })

  it('should return "dark" when the media query matches', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current).toBe('dark')
  })
})
