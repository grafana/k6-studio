import { renderHook } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCloseSplashScreen } from './useCloseSplashScreen'

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
