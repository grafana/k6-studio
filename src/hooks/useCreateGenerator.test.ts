import { useNavigate } from 'react-router-dom'
import { useCreateGenerator } from './useCreateGenerator'
import { createNewGeneratorFile } from '@/utils/generator'
import { generateFileNameWithTimestamp } from '@/utils/file'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/utils/generator', () => ({
  createNewGeneratorFile: vi.fn(),
}))
vi.mock('@/utils/file', () => ({
  generateFileNameWithTimestamp: vi.fn(),
}))
vi.mock('@/routeMap', () => ({
  getRoutePath: vi.fn(),
}))
vi.mock('@/store/ui/useToast', () => ({
  useToast: vi.fn(),
}))

describe('useCreateGenerator', () => {
  const navigate = vi.fn()
  const showToast = vi.fn()

  beforeEach(() => {
    ;(useNavigate as Mock).mockReturnValue(navigate)
    ;(useToast as Mock).mockReturnValue(showToast)
    vi.clearAllMocks()
  })

  it('should navigate to the correct path on successful generator creation', async () => {
    const newGenerator = { id: 'test' }
    const fileName = 'test-file.json'
    const routePath = '/generator/test-file.json'

    ;(createNewGeneratorFile as Mock).mockReturnValue(newGenerator)
    ;(generateFileNameWithTimestamp as Mock).mockReturnValue(fileName)
    ;(getRoutePath as Mock).mockReturnValue(routePath)
    window.studio = {
      ...window.studio,
      generator: {
        saveGenerator: vi.fn().mockResolvedValue(fileName),
        loadGenerator: vi.fn(),
      },
    }

    const { result } = renderHook(() => useCreateGenerator())

    await act(async () => {
      await result.current()
    })

    expect(createNewGeneratorFile).toHaveBeenCalled()
    expect(generateFileNameWithTimestamp).toHaveBeenCalledWith(
      'json',
      'Generator'
    )
    expect(window.studio.generator.saveGenerator).toHaveBeenCalledWith(
      JSON.stringify(newGenerator, null, 2),
      fileName
    )
    expect(navigate).toHaveBeenCalledWith(routePath)
  })

  it('should show a toast message on failure', async () => {
    const error = new Error('Test error')
    window.studio = {
      ...window.studio,
      generator: {
        saveGenerator: vi.fn().mockRejectedValue(error),
        loadGenerator: vi.fn(),
      },
    }

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
