import { describe, expect, it } from 'vitest'

import * as v1 from './v1'
import * as v2 from './v2'
import * as v3 from './v3'
import * as v4 from './v4'

import { migrate } from '.'

describe('Settings migration', () => {
  it('should migrate from v1 to latest', () => {
    const v1Settings: v1.AppSettings = {
      version: '1.0',
      proxy: {
        mode: 'regular',
        port: 6000,
        automaticallyFindPort: true,
        sslInsecure: false,
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

    expect(migration.version).toBe('5.0')
    expect(migration.telemetry.usageReport).toBe(v1Settings.usageReport.enabled)
  })

  it('should migrate from v2 to latest', () => {
    const v2Settings: v2.AppSettings = {
      version: '2.0',
      proxy: {
        mode: 'regular',
        port: 6000,
        automaticallyFindPort: true,
        sslInsecure: false,
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

    expect(migration.version).toBe('5.0')
    expect(migration.telemetry.usageReport).toBe(v2Settings.usageReport.enabled)
  })

  describe('v3 to v4', () => {
    it('should set browserRecorder when browserRecordingEnabled is true', () => {
      const v3Settings: v3.AppSettings = {
        version: '3.0',
        proxy: {
          mode: 'regular',
          port: 6000,
          automaticallyFindPort: true,
          sslInsecure: false,
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
        telemetry: {
          usageReport: true,
          errorReport: true,
        },
        appearance: {
          theme: 'system',
        },
        ai: {
          provider: 'openai',
          apiKey: 'abcdef',
        },
      }

      const migration = v3.migrate(v3Settings)

      expect(migration.version).toBe('4.0')
      expect(migration.recorder.browserRecording).toBeDefined()
    })

    it('should set browserRecorder when browserRecordingEnabled is false', () => {
      const v3Settings: v3.AppSettings = {
        version: '3.0',
        proxy: {
          mode: 'regular',
          port: 6000,
          automaticallyFindPort: true,
          sslInsecure: false,
        },
        recorder: {
          detectBrowserPath: true,
          enableBrowserRecorder: false,
        },
        windowState: {
          width: 1200,
          height: 800,
          x: 0,
          y: 0,
          isMaximized: true,
        },
        telemetry: {
          usageReport: true,
          errorReport: true,
        },
        appearance: {
          theme: 'system',
        },
        ai: {
          provider: 'openai',
          apiKey: 'abcdef',
        },
      }

      const migration = v3.migrate(v3Settings)

      expect(migration.version).toBe('4.0')
      expect(migration.recorder.browserRecording).toBeDefined()
    })
  })

  describe('v4 to v5', () => {
    const v4Settings: v4.AppSettings = {
      version: '4.0',
      proxy: {
        mode: 'regular',
        port: 6000,
        automaticallyFindPort: true,
        sslInsecure: false,
      },
      recorder: {
        detectBrowserPath: true,
        browserRecording: 'extension',
      },
      windowState: {
        width: 1200,
        height: 800,
        x: 0,
        y: 0,
        isMaximized: true,
      },
      telemetry: {
        usageReport: true,
        errorReport: true,
      },
      appearance: {
        theme: 'system',
      },
      ai: {
        provider: 'openai',
        apiKey: 'encrypted-key',
      },
    }

    it('should drop the ai block entirely', () => {
      const migration = v4.migrate(v4Settings)

      expect(migration.version).toBe('5.0')
      expect('ai' in migration).toBe(false)
    })

    it('should preserve non-ai fields unchanged', () => {
      const migration = v4.migrate(v4Settings)

      expect(migration.proxy).toEqual(v4Settings.proxy)
      expect(migration.recorder).toEqual(v4Settings.recorder)
      expect(migration.windowState).toEqual(v4Settings.windowState)
      expect(migration.telemetry).toEqual(v4Settings.telemetry)
      expect(migration.appearance).toEqual(v4Settings.appearance)
    })

    it('should migrate v4 to latest through the orchestrator', () => {
      const migration = migrate(v4Settings)

      expect(migration.version).toBe('5.0')
      expect('ai' in migration).toBe(false)
    })
  })
})
