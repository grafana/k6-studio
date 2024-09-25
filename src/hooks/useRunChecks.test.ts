import { createK6Check } from '@/test/factories/k6Check'
import { useRunChecks } from './useRunChecks'
import { K6Check } from '@/types'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const onScriptCheck = vi.fn()

beforeAll(() => {
  window.studio = {
    ...window.studio,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    script: {
      onScriptCheck,
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRunChecks', () => {
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
    const mockChecks: K6Check[] = [
      createK6Check({ id: '1', name: 'Check 1' }),
      createK6Check({ id: '2', name: 'Check 2' }),
    ]
    onScriptCheck.mockImplementation((callback) => {
      callback(mockChecks)
      return () => {}
    })

    const { result } = renderHook(() => useRunChecks())

    expect(result.current.checks).toEqual(mockChecks)
  })
})
