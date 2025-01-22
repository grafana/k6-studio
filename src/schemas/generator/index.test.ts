import { describe, expect, it } from 'vitest'
import { migrate } from '.'
import * as v0 from './v0'

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
      rules: [],
      allowlist: [],
      includeStaticAssets: false,
      scriptName: 'my-script.js',
    }

    const migration = migrate(v0Generator)
    expect(migration.version).toBe('1.0')
    expect(migration.thresholds).toEqual([])
  })
})
