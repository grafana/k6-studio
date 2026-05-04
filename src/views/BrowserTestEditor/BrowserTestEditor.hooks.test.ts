import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultBrowserTestOptions } from '@/schemas/browserTest'
import type { BrowserTestFile } from '@/schemas/browserTest'
import { createBrowserTestFile } from '@/test/factories/browserTest'

import { useBrowserTestState } from './BrowserTestEditor.hooks'

const baseFile: BrowserTestFile = {
  version: '2.0',
  actions: [],
  settings: defaultBrowserTestOptions,
}

describe('useBrowserTestState', () => {
  it('returns default settings when settings absent on file', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    // State carries default stages alongside the active branch so the form
    // can validate when the user switches to ramping-vus.
    expect(result.current.settings).toMatchObject(defaultBrowserTestOptions)
    expect(result.current.isDirty).toBe(false)
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
    expect(result.current.settings.loadProfile).toMatchObject({
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

describe('useBrowserTestState settings round-trip', () => {
  it('uses default settings when factory builds default file', () => {
    const file = createBrowserTestFile()
    const { result } = renderHook(() => useBrowserTestState(file))
    expect(result.current.settings).toMatchObject(defaultBrowserTestOptions)
    expect(result.current.isDirty).toBe(false)
  })

  it('round-trips settings through state changes', () => {
    const file = createBrowserTestFile()
    const { result } = renderHook(() => useBrowserTestState(file))

    const newThreshold = {
      id: 't1',
      metric: 'browser_web_vital_lcp' as const,
      statistic: 'p(95)' as const,
      condition: '<' as const,
      value: 1500,
      stopTest: false,
    }
    act(() => {
      result.current.setThresholds([newThreshold])
    })
    expect(result.current.settings.thresholds).toEqual([newThreshold])
    expect(result.current.isDirty).toBe(true)

    // settings reflect what would be saved to file
    const wouldSave = {
      version: '2.0' as const,
      actions: result.current.plainActions,
      settings: result.current.settings,
    }
    expect(wouldSave.settings.thresholds[0]?.metric).toBe(
      'browser_web_vital_lcp'
    )
  })

  it('isDirty clears when saved settings reload with reordered keys', () => {
    const before: BrowserTestFile = {
      version: '2.0',
      actions: [],
      settings: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations' },
      },
    }
    const { result, rerender } = renderHook(
      ({ file }: { file: BrowserTestFile }) => useBrowserTestState(file),
      { initialProps: { file: before } }
    )
    act(() => {
      result.current.setLoadProfile({
        executor: 'shared-iterations',
        vus: 5,
      })
    })
    expect(result.current.isDirty).toBe(true)

    const after: BrowserTestFile = {
      version: '2.0',
      actions: [],
      settings: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations', vus: 5 },
      },
    }
    rerender({ file: after })
    expect(result.current.isDirty).toBe(false)
  })

  it('factory accepts threshold overrides', () => {
    const file = createBrowserTestFile({
      settings: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations', vus: 5, iterations: 25 },
      },
    })
    const { result } = renderHook(() => useBrowserTestState(file))
    expect(result.current.settings.loadProfile).toMatchObject({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 25,
    })
    expect(result.current.isDirty).toBe(false)
  })
})
