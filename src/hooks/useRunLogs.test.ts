import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { LogEntry } from '@/schemas/k6'
import { createK6Log } from '@/test/factories/k6Log'

import { useRunLogs } from './useRunLogs'

const onScriptLog = vi.fn()

describe('useRunLogs', () => {
  beforeAll(() => {
    vi.stubGlobal('studio', {
      script: {
        onScriptLog,
      },
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

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
    onScriptLog.mockImplementation((callback: (log: LogEntry) => void) => {
      callback(mockLog)
      return () => {}
    })

    const { result } = renderHook(() => useRunLogs())

    expect(result.current.logs).toEqual([mockLog])
  })
})
