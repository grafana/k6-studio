import { describe, expect, it } from 'vitest'

import * as v1 from './v1'

import { BrowserTestFileDataSchema, migrate } from '.'

describe('BrowserTestFile migration', () => {
  it('parses a v2 file unchanged', () => {
    const v2File = {
      version: '2.0' as const,
      actions: [],
      settings: {
        loadProfile: {
          executor: 'shared-iterations' as const,
          vus: 1,
          iterations: 1,
        },
        thresholds: [],
        cloud: { loadZones: { distribution: 'even' as const, zones: [] } },
      },
    }
    const parsed = BrowserTestFileDataSchema.parse(v2File)
    expect(parsed.version).toBe('2.0')
    expect(parsed.settings.loadProfile.executor).toBe('shared-iterations')
  })

  it('migrates a v1 file to v2 with default settings', () => {
    const v1File: v1.BrowserTestFile = {
      version: '1.0',
      actions: [],
    }
    const result = migrate(v1File)
    expect(result.version).toBe('2.0')
    expect(result.settings.loadProfile.executor).toBe('shared-iterations')
    expect(result.settings.thresholds).toEqual([])
    expect(result.settings.cloud.loadZones.zones).toEqual([])
  })

  it('rejects malformed input', () => {
    const result = BrowserTestFileDataSchema.safeParse({ version: '99' })
    expect(result.success).toBe(false)
  })
})
