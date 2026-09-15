import { describe, expect, it } from 'vitest'

import { createGeneratorData } from '@/test/factories/generator'

import * as v0 from './v0'

import { GeneratorFileDataSchema, migrate } from '.'

describe('Generator migration', () => {
  it('should migrate from v0 to latest', () => {
    const v0Generator: v0.GeneratorSchema = {
      version: '0',
      recordingPath: 'test',
      options: {
        loadProfile: {
          executor: 'shared-iterations',
          vus: 1,
          iterations: 1,
        },
        thinkTime: {
          sleepType: 'iterations',
          timing: {
            type: 'fixed',
            value: 1,
          },
        },
      },
      testData: {
        variables: [],
      },
      rules: [
        {
          id: '1',
          type: 'verification',
          enabled: true,
          filter: {
            path: '',
          },
          value: {
            type: 'recordedValue',
          },
        },
      ],
      allowlist: [],
      includeStaticAssets: false,
      scriptName: 'my-script.js',
    }

    const migration = migrate(v0Generator)
    expect(migration.version).toBe('3.0')
    expect(migration.options.thresholds).toEqual([])
    expect(migration.recordingPath).toBe('../Recordings/test')
  })
})

describe('wizardUsed flag', () => {
  it('defaults to false for files saved before the flag existed', () => {
    const generator = createGeneratorData()
    // Simulate a pre-flag file on disk.
    const { wizardUsed: _wizardUsed, ...legacyFile } = generator

    expect(GeneratorFileDataSchema.parse(legacyFile).wizardUsed).toBe(false)
  })

  it('round-trips a wizard-configured generator', () => {
    const generator = createGeneratorData({ wizardUsed: true })

    expect(GeneratorFileDataSchema.parse(generator).wizardUsed).toBe(true)
  })
})
