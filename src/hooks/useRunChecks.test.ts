import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { Check } from '@/schemas/k6'
import { createK6Check } from '@/test/factories/k6Check'

import { useRunChecks } from './useRunChecks'

const onScriptCheck = vi.fn()

describe('useRunChecks', () => {
  beforeAll(() => {
    vi.stubGlobal('studio', {
      script: {
        onScriptCheck,
      },
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with an empty array of checks', () => {
    const { result } = renderHook(() => useRunChecks())

    expect(result.current.checks).toEqual([])
  })

  it('should reset checks to an empty array', () => {
    const { result } = renderHook(() => useRunChecks())

    act(() => {
      result.current.resetChecks()
    })

    expect(result.current.checks).toEqual([])
  })

  it('should update checks when onScriptCheck is called', () => {
    const mockChecks: Check[] = [
      createK6Check({ id: '1', name: 'Check 1' }),
      createK6Check({ id: '2', name: 'Check 2' }),
    ]
    onScriptCheck.mockImplementation((callback: (data: Check[]) => void) => {
      callback(mockChecks)
      return () => {}
    })

    const { result } = renderHook(() => useRunChecks())

    expect(result.current.checks).toEqual(mockChecks)
  })
})
