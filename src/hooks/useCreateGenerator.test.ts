import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRoutePath } from '@/routeMap'

import { useCreateGenerator } from './useCreateGenerator'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/routeMap', () => ({
  getRoutePath: vi.fn(),
}))

describe('useCreateGenerator', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(getRoutePath).mockImplementation(((name: string) => {
      if (name === 'newGenerator') return '/new/generator'
      return '/file/'
    }) as typeof getRoutePath)
    vi.clearAllMocks()
  })

  it('should navigate to new generator route when called without recording path', () => {
    const { result } = renderHook(() => useCreateGenerator())

    act(() => {
      result.current()
    })

    expect(navigate).toHaveBeenCalledWith('/new/generator')
  })

  it('should navigate to new generator route with recording query param when called with recording path', () => {
    const { result } = renderHook(() => useCreateGenerator())
    const recordingPath = '/path/to/recording.har'

    act(() => {
      result.current(recordingPath)
    })

    expect(navigate).toHaveBeenCalledWith(
      '/new/generator?recording=' + encodeURIComponent(recordingPath)
    )
  })
})
