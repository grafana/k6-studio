import {
  existsSync,
  readFileSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let tempDir: string

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => tempDir),
  },
  nativeTheme: { themeSource: 'system' },
  dialog: { showOpenDialog: vi.fn() },
  BrowserWindow: vi.fn(),
}))

vi.mock('./proxy', () => ({
  stopProxyProcess: vi.fn(),
  launchProxyAndAttachEmitter: vi.fn(),
}))

vi.mock('@/services/http', () => ({
  configureSystemProxy: vi.fn(),
}))

const baseSharedSettings = {
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
  telemetry: { usageReport: true, errorReport: true },
  appearance: { theme: 'system' },
}

function readSettingsFile(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
}

describe('initSettings disk migration', () => {
  let filePath: string

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(tmpdir(), 'k6-studio-settings-'))
    const fileName =
      process.env.NODE_ENV === 'development'
        ? 'k6-studio-dev.json'
        : 'k6-studio.json'
    filePath = path.join(tempDir, fileName)
    vi.resetModules()
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('writes defaults when the file is missing', async () => {
    const { initSettings, defaultSettings } = await import('./settings')

    await initSettings()

    expect(existsSync(filePath)).toBe(true)
    expect(readSettingsFile(filePath)).toEqual(defaultSettings)
  })

  it('migrates a v4 file on disk and strips the encrypted api key', async () => {
    const v4Settings = {
      version: '4.0',
      ...baseSharedSettings,
      ai: { provider: 'openai', apiKey: 'encrypted-key-string' },
    }
    writeFileSync(filePath, JSON.stringify(v4Settings))

    const { initSettings } = await import('./settings')
    await initSettings()

    const raw = readFileSync(filePath, 'utf-8')
    const parsed = readSettingsFile(filePath)

    expect(parsed.version).toBe('5.0')
    expect(parsed).not.toHaveProperty('ai')
    expect(raw).not.toContain('encrypted-key-string')
    expect(parsed.proxy).toEqual(baseSharedSettings.proxy)
    expect(parsed.recorder).toEqual(baseSharedSettings.recorder)
    expect(parsed.telemetry).toEqual(baseSharedSettings.telemetry)
    expect(parsed.appearance).toEqual(baseSharedSettings.appearance)
    expect(parsed.windowState).toEqual(baseSharedSettings.windowState)
  })

  it('leaves a v5 file untouched', async () => {
    const v5Settings = {
      version: '5.0',
      ...baseSharedSettings,
    }
    const originalRaw = JSON.stringify(v5Settings)
    writeFileSync(filePath, originalRaw)

    const { initSettings } = await import('./settings')
    await initSettings()

    expect(readFileSync(filePath, 'utf-8')).toBe(originalRaw)
  })
})
