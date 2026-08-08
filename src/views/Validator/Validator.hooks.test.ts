import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebugSession } from './Validator.hooks'

type Callback = (...args: unknown[]) => void
const noop = () => () => {}

const onScriptFinished = vi.fn<(cb: Callback) => () => void>()
const onScriptStopped = vi.fn<(cb: Callback) => () => void>()
const onScriptLog = vi.fn().mockImplementation(noop)
const onScriptCheck = vi.fn().mockImplementation(noop)
const onBrowserAction = vi.fn().mockImplementation(noop)
const onBrowserReplay = vi.fn().mockImplementation(noop)
const onProxyData = vi.fn().mockImplementation(noop)
const runScript = vi.fn().mockResolvedValue(undefined)
const stopScript = vi.fn()

describe('useDebugSession', () => {
  beforeAll(() => {
    vi.stubGlobal('studio', {
      script: {
        onScriptFinished,
        onScriptStopped,
        onScriptLog,
        onScriptCheck,
        onBrowserAction,
        onBrowserReplay,
        runScript,
        stopScript,
      },
      proxy: {
        onProxyData,
      },
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    onScriptFinished.mockImplementation(noop)
    onScriptStopped.mockImplementation(noop)
  })

  it('should start in pending state', () => {
    const { result } = renderHook(() =>
      useDebugSession({ type: 'file', path: '/test.js' })
    )

    expect(result.current.session.state).toBe('pending')
  })

  it('should transition to running when startDebugging is called', async () => {
    const { result } = renderHook(() =>
      useDebugSession({ type: 'file', path: '/test.js' })
    )

    await act(async () => {
      await result.current.startDebugging()
    })

    expect(result.current.session.state).toBe('running')
  })

  it('should transition to stopped on script:finished', async () => {
    let capturedCallback: Callback = () => {}
    onScriptFinished.mockImplementation((cb: Callback) => {
      capturedCallback = cb
      return () => {}
    })

    const { result } = renderHook(() =>
      useDebugSession({ type: 'file', path: '/test.js' })
    )

    await act(async () => {
      await result.current.startDebugging()
    })
    expect(result.current.session.state).toBe('running')

    act(() => {
      capturedCallback()
    })
    expect(result.current.session.state).toBe('stopped')
  })

  it('should transition to stopped on script:stopped (e.g. ScriptException exit)', async () => {
    let capturedCallback: Callback = () => {}
    onScriptStopped.mockImplementation((cb: Callback) => {
      capturedCallback = cb
      return () => {}
    })

    const { result } = renderHook(() =>
      useDebugSession({ type: 'file', path: '/test.js' })
    )

    await act(async () => {
      await result.current.startDebugging()
    })
    expect(result.current.session.state).toBe('running')

    act(() => {
      capturedCallback()
    })
    expect(result.current.session.state).toBe('stopped')
  })

  it('should transition to stopped when runScript rejects (pre-spawn failure)', async () => {
    runScript.mockRejectedValueOnce(new Error('proxy not ready'))

    const { result } = renderHook(() =>
      useDebugSession({ type: 'file', path: '/test.js' })
    )

    await act(async () => {
      await result.current.startDebugging()
    })

    expect(result.current.session.state).toBe('stopped')
  })
})
