import { createK6Log } from '@/test/factories/k6Log'
import { useRunLogs } from './useRunLogs'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const onScriptLog = vi.fn()

beforeAll(() => {
  window.studio = {
    ...window.studio,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    script: {
      onScriptLog,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRunLogs', () => {
  it('should initialize with an empty array of logs', () => {
    const { result } = renderHook(() => useRunLogs())

    expect(result.current.logs).toEqual([])
  })

  it('should reset logs to an empty array', () => {
    const { result } = renderHook(() => useRunLogs())

    act(() => {
      result.current.resetLogs()
    })

    expect(result.current.logs).toEqual([])
  })

  it('should update logs when onScriptLog is called', () => {
    const mockLog = createK6Log()
    onScriptLog.mockImplementation((callback) => {
      callback(mockLog)
      return () => {}
    })

    const { result } = renderHook(() => useRunLogs())

    expect(result.current.logs).toEqual([mockLog])
  })
})
