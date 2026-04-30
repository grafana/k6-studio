import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultBrowserTestOptions } from '@/schemas/browserTest'
import type { BrowserTestFile } from '@/schemas/browserTest'

import { useBrowserTestState } from './BrowserTestEditor.hooks'

const baseFile: BrowserTestFile = {
  version: '2.0',
  actions: [],
  settings: defaultBrowserTestOptions,
}

describe('useBrowserTestState', () => {
  it('returns default settings when settings absent on file', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    expect(result.current.settings).toEqual(defaultBrowserTestOptions)
  })

  it('setLoadProfile updates settings and marks dirty', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    act(() => {
      result.current.setLoadProfile({
        executor: 'shared-iterations',
        vus: 5,
        iterations: 10,
      })
    })
    expect(result.current.settings.loadProfile).toEqual({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 10,
    })
    expect(result.current.isDirty).toBe(true)
  })

  it('setThresholds replaces threshold list', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    const next = [
      {
        id: '1',
        metric: 'browser_web_vital_lcp' as const,
        statistic: 'p(95)' as const,
        condition: '<' as const,
        value: 1000,
        stopTest: false,
      },
    ]
    act(() => {
      result.current.setThresholds(next)
    })
    expect(result.current.settings.thresholds).toEqual(next)
  })

  it('setLoadZones replaces load zones', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    act(() => {
      result.current.setLoadZones({
        distribution: 'manual',
        zones: [{ id: '1', loadZone: 'amazon:us:columbus', percent: 100 }],
      })
    })
    expect(result.current.settings.cloud.loadZones.zones).toHaveLength(1)
  })

  it('isDirty=false when no changes', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    expect(result.current.isDirty).toBe(false)
  })
})
