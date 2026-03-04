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
    expect(migration.version).toBe('3.0')
    expect(migration.options.thresholds).toEqual([])
    expect(migration.recordingPath).toBe('../Recordings/test')
  })

  it('should migrate v2 recordingPath to relative path (v3)', () => {
    const v2Generator = {
      version: '2.0' as const,
      recordingPath: 'my-recording.har',
      options: {
        loadProfile: {
          executor: 'ramping-vus' as const,
          stages: [],
        },
        thinkTime: {
          sleepType: 'groups' as const,
          timing: { type: 'fixed' as const, value: 1 },
        },
        thresholds: [],
        cloud: {
          loadZones: { distribution: 'even' as const, zones: [] },
        },
      },
      testData: { variables: [], files: [] },
      rules: [],
      allowlist: [],
      includeStaticAssets: false,
      scriptName: 'my-script.js',
    }

    const migration = migrate(v2Generator)
    expect(migration.version).toBe('3.0')
    expect(migration.recordingPath).toBe('../Recordings/my-recording.har')
  })

  it('should keep empty recordingPath when migrating v2 to v3', () => {
    const v2Generator = {
      version: '2.0' as const,
      recordingPath: '',
      options: {
        loadProfile: {
          executor: 'ramping-vus' as const,
          stages: [],
        },
        thinkTime: {
          sleepType: 'groups' as const,
          timing: { type: 'fixed' as const, value: 1 },
        },
        thresholds: [],
        cloud: {
          loadZones: { distribution: 'even' as const, zones: [] },
        },
      },
      testData: { variables: [], files: [] },
      rules: [],
      allowlist: [],
      includeStaticAssets: false,
      scriptName: 'my-script.js',
    }

    const migration = migrate(v2Generator)
    expect(migration.version).toBe('3.0')
    expect(migration.recordingPath).toBe('')
  })
})
