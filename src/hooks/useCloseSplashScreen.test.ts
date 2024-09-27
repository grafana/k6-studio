import { renderHook } from '@testing-library/react'
import { useCloseSplashScreen } from './useCloseSplashScreen'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const closeSplashscreen = vi.fn()

beforeAll(() => {
  vi.stubGlobal('studio', {
    app: {
      closeSplashscreen,
    },
  })
})

describe('useCloseSplashScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call closeSplashscreen on mount', () => {
    renderHook(() => useCloseSplashScreen())

    expect(closeSplashscreen).toHaveBeenCalled()
  })
})
