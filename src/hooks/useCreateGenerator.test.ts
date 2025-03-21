import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

import { useCreateGenerator } from './useCreateGenerator'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/routeMap', () => ({
  getRoutePath: vi.fn(),
}))
vi.mock('@/store/ui/useToast', () => ({
  useToast: vi.fn(),
}))
vi.mock('electron-log/renderer', () => ({
  default: {
    error: vi.fn(),
  },
}))

describe('useCreateGenerator', () => {
  const navigate = vi.fn()
  const showToast = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useToast).mockReturnValue(showToast)
    vi.clearAllMocks()
  })

  it('should navigate to the correct path on successful generator creation', async () => {
    const fileName = 'test-file.json'
    const routePath = '/generator/test-file.json'

    vi.mocked(getRoutePath).mockReturnValue(routePath)
    vi.stubGlobal('studio', {
      generator: {
        createGenerator: vi.fn().mockResolvedValue(fileName),
        saveGenerator: vi.fn(),
        loadGenerator: vi.fn(),
      },
    })

    const { result } = renderHook(() => useCreateGenerator())

    await act(async () => {
      await result.current()
    })

    expect(window.studio.generator.createGenerator).toHaveBeenCalledWith('')
    expect(navigate).toHaveBeenCalledWith(routePath)
  })

  it('should show a toast message on failure', async () => {
    const error = new Error('Test error')
    vi.stubGlobal('studio', {
      generator: {
        saveGenerator: vi.fn().mockRejectedValue(error),
        loadGenerator: vi.fn(),
      },
    })

    const { result } = renderHook(() => useCreateGenerator())

    await act(async () => {
      await result.current()
    })

    expect(showToast).toHaveBeenCalledWith({
      status: 'error',
      title: 'Failed to create generator',
    })
  })
})
