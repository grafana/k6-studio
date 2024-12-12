import { describe, expect, it } from 'vitest'
import { migrate } from '.'
import * as v1 from './v1'

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

    expect(migrate(v1Settings).version).toBe('2.0')
  })
})
