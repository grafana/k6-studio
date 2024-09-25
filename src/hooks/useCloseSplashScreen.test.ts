import { renderHook } from '@testing-library/react'
import { useCloseSplashScreen } from './useCloseSplashScreen'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the closeSplashscreen method
const closeSplashscreen = vi.fn()

beforeAll(() => {
  window.studio = {
    ...window.studio,
    app: {
      closeSplashscreen,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCloseSplashScreen', () => {
  it('should call closeSplashscreen on mount', () => {
    renderHook(() => useCloseSplashScreen())

    expect(closeSplashscreen).toHaveBeenCalled()
  })
})
