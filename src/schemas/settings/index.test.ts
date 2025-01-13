import { describe, expect, it } from 'vitest'
import { migrate } from '.'
import * as v1 from './v1'
import * as v2 from './v2'

describe('Settings migration', () => {
  it('should migrate from v1 to latest', () => {
    const v1Settings: v1.AppSettings = {
      version: '1.0',
      proxy: {
        mode: 'regular',
        port: 6000,
        automaticallyFindPort: true,
      },
      recorder: {
        detectBrowserPath: true,
        enableBrowserRecorder: true,
      },
      windowState: {
        width: 1200,
        height: 800,
        x: 0,
        y: 0,
        isMaximized: true,
      },
      usageReport: {
        enabled: true,
      },
      appearance: {
        theme: 'system',
      },
    }

    const migration = migrate(v1Settings)

    expect(migration.version).toBe('3.0')
    expect(migration.telemetry.usageReport).toBe(v1Settings.usageReport.enabled)
  })

  it('should migrate from v2 to latest', () => {
    const v2Settings: v2.AppSettings = {
      version: '2.0',
      proxy: {
        mode: 'regular',
        port: 6000,
        automaticallyFindPort: true,
      },
      recorder: {
        detectBrowserPath: true,
        enableBrowserRecorder: true,
      },
      windowState: {
        width: 1200,
        height: 800,
        x: 0,
        y: 0,
        isMaximized: true,
      },
      usageReport: {
        enabled: true,
      },
      appearance: {
        theme: 'system',
      },
    }

    const migration = migrate(v2Settings)

    expect(migration.version).toBe('3.0')
    expect(migration.telemetry.usageReport).toBe(v2Settings.usageReport.enabled)
  })
})
