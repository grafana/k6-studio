import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { StackHealthStatus } from '@/handlers/ai/a2a/stackHealth'

import { useStackHealth } from './useStackHealth'

const checkStackHealthMock = vi.fn<() => Promise<StackHealthStatus>>()

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useStackHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('studio', {
      ai: { assistantCheckStackHealth: checkStackHealthMock },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns "ready" when stack is healthy', async () => {
    checkStackHealthMock.mockResolvedValue('ready')

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isStackReady).toBe(true)
    })
  })

  it('returns not ready when stack is loading', async () => {
    checkStackHealthMock.mockResolvedValue('loading')

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isStackReady).toBe(false)
    })
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useStackHealth(false), {
      wrapper: createWrapper(),
    })

    expect(checkStackHealthMock).not.toHaveBeenCalled()
    // Still reports ready via placeholder (no blocking when disabled)
    expect(result.current.isStackReady).toBe(true)
  })

  it('assumes ready as placeholder while loading', () => {
    checkStackHealthMock.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    // placeholderData should make it ready while query is pending
    expect(result.current.isStackReady).toBe(true)
  })
})
