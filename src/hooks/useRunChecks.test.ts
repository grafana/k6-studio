import { useRunChecks } from './useRunChecks'
import { K6Check } from '@/types'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const onScriptCheck = vi.fn()

function createCheck(check: Partial<K6Check>): K6Check {
  return {
    id: '1',
    name: 'Check',
    path: 'path',
    passes: 1,
    fails: 0,
    ...check,
  }
}

beforeAll(() => {
  window.studio = {
    ...window.studio,
    script: {
      ...window.studio.script,
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
      createCheck({ id: '1', name: 'Check 1' }),
      createCheck({ id: '2', name: 'Check 2' }),
    ]
    onScriptCheck.mockImplementation((callback) => {
      callback(mockChecks)
      return () => {}
    })

    const { result } = renderHook(() => useRunChecks())

    expect(result.current.checks).toEqual(mockChecks)
  })
})
