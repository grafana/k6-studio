import { renderHook, waitFor } from '@testing-library/react'
import { Dictionary } from 'lodash'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useGeneratorStore,
  selectFilteredRequests,
  selectGeneratorData,
} from '@/store/generator'
import {
  createGeneratorData,
  createGeneratorState,
} from '@/test/factories/generator'
import { ProxyData } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { generateScriptPreview } from '@/views/Generator/Generator.utils'

import { useScriptPreview } from './useScriptPreview'

vi.mock('lodash-es', () => ({
  debounce: vi.fn((fn: () => void) => fn),
}))
vi.mock('@/store/generator', () => ({
  useGeneratorStore: {
    getState: vi.fn(),
    subscribe: vi.fn(),
  },
  selectFilteredRequests: vi.fn(),
  selectGeneratorData: vi.fn(),
}))
vi.mock('@/utils/groups', () => ({
  groupProxyData: vi.fn(),
}))
vi.mock('@/views/Generator/Generator.utils', () => ({
  generateScriptPreview: vi.fn(),
}))

describe('useScriptPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with an empty preview and no error', () => {
    const mockState = createGeneratorState()
    vi.mocked(useGeneratorStore.getState).mockReturnValue(mockState)
    const { result } = renderHook(() => useScriptPreview())

    expect(result.current.preview).toBe('')
    expect(result.current.error).toBeUndefined()
    expect(result.current.hasError).toBe(false)
  })

  it('should update the preview when the store state changes', async () => {
    const mockState = createGeneratorState()
    const mockGeneratorData = createGeneratorData()
    const mockRequests: ProxyData[] = []
    const mockGroupedRequests: Dictionary<ProxyData[]> = {}
    const mockScript = 'mock script'

    vi.mocked(useGeneratorStore.getState).mockReturnValue(mockState)
    vi.mocked(selectGeneratorData).mockReturnValue(mockGeneratorData)
    vi.mocked(selectFilteredRequests).mockReturnValue(mockRequests)
    vi.mocked(groupProxyData).mockReturnValue(mockGroupedRequests)
    vi.mocked(generateScriptPreview).mockResolvedValue(mockScript)

    const { result } = renderHook(() => useScriptPreview())

    await waitFor(() => {
      expect(result.current.preview).toBe(mockScript)
      expect(result.current.error).toBeUndefined()
      expect(result.current.hasError).toBe(false)
    })
  })

  it('should set an error when generateScriptPreview throws an error', async () => {
    const mockState = createGeneratorState()
    const mockGeneratorData = createGeneratorData()
    const mockRequests: ProxyData[] = []
    const mockGroupedRequests: Dictionary<ProxyData[]> = {}
    const mockError = new Error('mock error')

    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(useGeneratorStore.getState).mockReturnValue(mockState)
    vi.mocked(selectGeneratorData).mockReturnValue(mockGeneratorData)
    vi.mocked(selectFilteredRequests).mockReturnValue(mockRequests)
    vi.mocked(groupProxyData).mockReturnValue(mockGroupedRequests)
    vi.mocked(generateScriptPreview).mockRejectedValue(mockError)

    const { result } = renderHook(() => useScriptPreview())

    await waitFor(() => {
      expect(result.current.preview).toBe('')
      expect(result.current.error).toBe(mockError)
      expect(result.current.hasError).toBe(true)
    })
  })
})
