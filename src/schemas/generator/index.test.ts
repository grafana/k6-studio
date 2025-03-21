import { describe, expect, it } from 'vitest'

import * as v0 from './v0'

import { migrate } from '.'

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
    expect(migration.version).toBe('2.0')
    expect(migration.options.thresholds).toEqual([])
  })
})
