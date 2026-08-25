import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  StackHealthStatus,
  StackWakeResult,
} from '@/handlers/ai/a2a/stackHealth'

import { useStackHealth } from './useStackHealth'

const checkStackHealthMock = vi.fn<() => Promise<StackHealthStatus>>()
const wakeStackMock = vi.fn<() => Promise<StackWakeResult>>()

const stackUrl = 'https://mystack.grafana.net'

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
    wakeStackMock.mockResolvedValue({ status: 'awake' })
    vi.stubGlobal('studio', {
      ai: {
        assistantCheckStackHealth: checkStackHealthMock,
        assistantWakeStack: wakeStackMock,
      },
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
    expect(result.current.isStackReady).toBe(true)
  })

  it('reports not ready while first health check is pending', () => {
    checkStackHealthMock.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    expect(result.current.isStackReady).toBe(false)
  })

  it('calls wake once when enabled', async () => {
    checkStackHealthMock.mockResolvedValue('ready')

    renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(wakeStackMock).toHaveBeenCalledTimes(1)
    })
  })

  it('does not wake the stack again when reopened right away', async () => {
    checkStackHealthMock.mockResolvedValue('loading')
    const wrapper = createWrapper()

    const { unmount } = renderHook(() => useStackHealth(true), { wrapper })

    await waitFor(() => {
      expect(wakeStackMock).toHaveBeenCalledTimes(1)
    })

    unmount()
    const { result } = renderHook(() => useStackHealth(true), { wrapper })

    await waitFor(() => {
      expect(result.current.isStackReady).toBe(false)
    })

    expect(wakeStackMock).toHaveBeenCalledTimes(1)
  })

  it('wakes the stack again when reopened after the throttle window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    checkStackHealthMock.mockResolvedValue('loading')
    const wrapper = createWrapper()

    const { unmount } = renderHook(() => useStackHealth(true), { wrapper })

    await waitFor(() => {
      expect(wakeStackMock).toHaveBeenCalledTimes(1)
    })

    unmount()
    vi.setSystemTime(Date.now() + 16 * 60 * 1000)
    renderHook(() => useStackHealth(true), { wrapper })

    await waitFor(() => {
      expect(wakeStackMock).toHaveBeenCalledTimes(2)
    })

    vi.useRealTimers()
  })

  it('does not call wake when disabled', () => {
    renderHook(() => useStackHealth(false), {
      wrapper: createWrapper(),
    })

    expect(wakeStackMock).not.toHaveBeenCalled()
  })

  it('exposes the stack url when the instance waits for a captcha', async () => {
    checkStackHealthMock.mockResolvedValue('loading')
    wakeStackMock.mockResolvedValue({
      status: 'captcha-required',
      url: stackUrl,
    })

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.captchaUrl).toBe(stackUrl)
    })
  })

  it('does not expose a captcha url once the stack is ready', async () => {
    checkStackHealthMock.mockResolvedValue('ready')
    wakeStackMock.mockResolvedValue({
      status: 'captcha-required',
      url: stackUrl,
    })

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isStackReady).toBe(true)
    })

    expect(result.current.captchaUrl).toBeNull()
  })

  it('does not expose a captcha url while the stack is only booting', async () => {
    checkStackHealthMock.mockResolvedValue('loading')
    wakeStackMock.mockResolvedValue({ status: 'loading' })

    const { result } = renderHook(() => useStackHealth(true), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isStackReady).toBe(false)
    })

    expect(result.current.captchaUrl).toBeNull()
  })
})
