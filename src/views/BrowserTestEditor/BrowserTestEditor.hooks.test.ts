import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  defaultBrowserTestOptions,
  type BrowserTestFile,
} from '@/schemas/browserTest'
import { createBrowserTestFile } from '@/test/factories/browserTest'

import { useBrowserTestState } from './BrowserTestEditor.hooks'

const baseFile: BrowserTestFile = {
  version: '1.0',
  actions: [],
  options: defaultBrowserTestOptions,
}

describe('useBrowserTestState', () => {
  it('returns default options when options absent on file', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    // State carries default stages alongside the active branch so the form
    // can validate when the user switches to ramping-vus.
    expect(result.current.options).toMatchObject(defaultBrowserTestOptions)
    expect(result.current.isDirty).toBe(false)
  })

  it('setLoadProfile updates options and marks dirty', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    act(() => {
      result.current.setLoadProfile({
        executor: 'shared-iterations',
        vus: 5,
        iterations: 10,
      })
    })
    expect(result.current.options.loadProfile).toMatchObject({
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
        enabled: true,
      },
    ]
    act(() => {
      result.current.setThresholds(next)
    })
    expect(result.current.options.thresholds).toEqual(next)
  })

  it('setLoadZones replaces load zones', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    act(() => {
      result.current.setLoadZones({
        distribution: 'manual',
        zones: [{ id: '1', loadZone: 'amazon:us:columbus', percent: 100 }],
      })
    })
    expect(result.current.options.cloud.loadZones.zones).toHaveLength(1)
  })

  it('isDirty=false when no changes', () => {
    const { result } = renderHook(() => useBrowserTestState(baseFile))
    expect(result.current.isDirty).toBe(false)
  })
})

describe('useBrowserTestState options round-trip', () => {
  it('uses default options when factory builds default file', () => {
    const file = createBrowserTestFile()
    const { result } = renderHook(() => useBrowserTestState(file))
    expect(result.current.options).toMatchObject(defaultBrowserTestOptions)
    expect(result.current.isDirty).toBe(false)
  })

  it('round-trips options through state changes', () => {
    const file = createBrowserTestFile()
    const { result } = renderHook(() => useBrowserTestState(file))

    const newThreshold = {
      id: 't1',
      metric: 'browser_web_vital_lcp' as const,
      statistic: 'p(95)' as const,
      condition: '<' as const,
      value: 1500,
      stopTest: false,
      enabled: true,
    }
    act(() => {
      result.current.setThresholds([newThreshold])
    })
    expect(result.current.options.thresholds).toEqual([newThreshold])
    expect(result.current.isDirty).toBe(true)

    // options reflect what would be saved to file
    const wouldSave = {
      version: '1.0' as const,
      actions: result.current.actions,
      options: result.current.options,
    }

    expect(wouldSave.options.thresholds[0]?.metric).toBe(
      'browser_web_vital_lcp'
    )
  })

  it('isDirty clears when markAsSaved is called after options change', () => {
    const before: BrowserTestFile = {
      version: '1.0',
      actions: [],
      options: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations' },
      },
    }
    const { result } = renderHook(() => useBrowserTestState(before))
    act(() => {
      result.current.setLoadProfile({
        executor: 'shared-iterations',
        vus: 5,
      })
    })
    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.markAsSaved()
    })
    expect(result.current.isDirty).toBe(false)
  })

  it('isDirty clears after markAsSaved when switching executors and back', () => {
    const customStages = [
      { target: 10, duration: '2m' as const },
      { target: 30, duration: '4m' as const },
    ]
    const before: BrowserTestFile = {
      version: '1.0',
      actions: [],
      options: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations' },
      },
    }
    const { result } = renderHook(() => useBrowserTestState(before))

    act(() => {
      result.current.setLoadProfile({
        executor: 'ramping-vus',
        stages: customStages,
      })
    })
    act(() => {
      result.current.setLoadProfile({
        executor: 'shared-iterations',
        vus: 2,
        iterations: 5,
      })
    })
    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.markAsSaved()
    })
    expect(result.current.isDirty).toBe(false)
  })

  it('factory accepts threshold overrides', () => {
    const file = createBrowserTestFile({
      options: {
        ...defaultBrowserTestOptions,
        loadProfile: { executor: 'shared-iterations', vus: 5, iterations: 25 },
      },
    })
    const { result } = renderHook(() => useBrowserTestState(file))
    expect(result.current.options.loadProfile).toMatchObject({
      executor: 'shared-iterations',
      vus: 5,
      iterations: 25,
    })
    expect(result.current.isDirty).toBe(false)
  })
})
