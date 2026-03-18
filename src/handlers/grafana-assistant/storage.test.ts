import { readFile, writeFile } from 'fs/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConnectionTokens } from './storage'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/user/data'),
  },
}))

vi.mock('fs/promises')

vi.mock('@/main/encryption', () => ({
  encryptString: vi.fn((s: string) => `encrypted:${s}`),
  decryptString: vi.fn((s: string) => s.replace('encrypted:', '')),
  isEncryptionAvailable: vi.fn(() => false),
}))

const mockedReadFile = vi.mocked(readFile)
const mockedWriteFile = vi.mocked(writeFile)

// Import after mocks are set up
const {
  saveConnection,
  getConnection,
  removeConnection,
  getFirstStoredGrafanaUrl,
} = await import('./storage')

const { isEncryptionAvailable, encryptString, decryptString } =
  await import('@/main/encryption')
const mockedIsEncryptionAvailable = vi.mocked(isEncryptionAvailable)
const mockedEncryptString = vi.mocked(encryptString)
const mockedDecryptString = vi.mocked(decryptString)

const sampleTokens: ConnectionTokens = {
  apiEndpoint: 'https://api.example.com',
  gatToken: 'gat-token-value',
  garToken: 'gar-token-value',
  expiresAt: '2026-12-31T00:00:00Z',
  refreshExpiresAt: '2027-12-31T00:00:00Z',
}

function makeStore(
  connections: Record<string, object> = {},
  version = '1.0'
): string {
  return JSON.stringify({ version, connections })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedWriteFile.mockResolvedValue(undefined)
})

describe('saveConnection', () => {
  it('writes a new connection to the store without encryption', async () => {
    mockedIsEncryptionAvailable.mockReturnValue(false)
    mockedReadFile.mockRejectedValue(new Error('not found'))

    await saveConnection('https://grafana.example.com', sampleTokens)

    expect(mockedWriteFile).toHaveBeenCalledOnce()
    const written = JSON.parse(
      mockedWriteFile.mock.calls[0]![1] as string
    ) as object
    expect(written).toMatchObject({
      version: '1.0',
      connections: {
        'https://grafana.example.com': {
          grafanaUrl: 'https://grafana.example.com',
          apiEndpoint: sampleTokens.apiEndpoint,
          gatToken: sampleTokens.gatToken,
          garToken: sampleTokens.garToken,
          encrypted: false,
        },
      },
    })
  })

  it('encrypts tokens when encryption is available', async () => {
    mockedIsEncryptionAvailable.mockReturnValue(true)
    mockedReadFile.mockRejectedValue(new Error('not found'))

    await saveConnection('https://grafana.example.com', sampleTokens)

    expect(mockedEncryptString).toHaveBeenCalledWith(sampleTokens.gatToken)
    expect(mockedEncryptString).toHaveBeenCalledWith(sampleTokens.garToken)

    const written = JSON.parse(
      mockedWriteFile.mock.calls[0]![1] as string
    ) as object
    expect(written).toMatchObject({
      connections: {
        'https://grafana.example.com': {
          gatToken: `encrypted:${sampleTokens.gatToken}`,
          garToken: `encrypted:${sampleTokens.garToken}`,
          encrypted: true,
        },
      },
    })
  })

  it('normalizes trailing slashes in the URL key', async () => {
    mockedIsEncryptionAvailable.mockReturnValue(false)
    mockedReadFile.mockRejectedValue(new Error('not found'))

    await saveConnection('https://grafana.example.com/', sampleTokens)

    const written = JSON.parse(mockedWriteFile.mock.calls[0]![1] as string) as {
      connections: Record<string, unknown>
    }
    expect(Object.keys(written.connections)).toContain(
      'https://grafana.example.com'
    )
  })

  it('merges into an existing store', async () => {
    const existing = makeStore({
      'https://other.example.com': {
        grafanaUrl: 'https://other.example.com',
        apiEndpoint: 'https://other-api.com',
        gatToken: 'old-gat',
        garToken: 'old-gar',
        expiresAt: '2025-01-01T00:00:00Z',
        refreshExpiresAt: '2025-06-01T00:00:00Z',
        encrypted: false,
      },
    })
    mockedIsEncryptionAvailable.mockReturnValue(false)
    mockedReadFile.mockResolvedValue(existing)

    await saveConnection('https://grafana.example.com', sampleTokens)

    const written = JSON.parse(mockedWriteFile.mock.calls[0]![1] as string) as {
      connections: Record<string, unknown>
    }
    expect(Object.keys(written.connections)).toHaveLength(2)
  })
})

describe('getConnection', () => {
  it('returns null when the URL is not in the store', async () => {
    mockedReadFile.mockRejectedValue(new Error('not found'))

    const result = await getConnection('https://grafana.example.com')
    expect(result).toBeNull()
  })

  it('returns tokens for a known URL', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        ...sampleTokens,
        encrypted: false,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    const result = await getConnection('https://grafana.example.com')
    expect(result).toEqual(sampleTokens)
  })

  it('decrypts tokens when encrypted flag is true', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        apiEndpoint: sampleTokens.apiEndpoint,
        gatToken: `encrypted:${sampleTokens.gatToken}`,
        garToken: `encrypted:${sampleTokens.garToken}`,
        expiresAt: sampleTokens.expiresAt,
        refreshExpiresAt: sampleTokens.refreshExpiresAt,
        encrypted: true,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    const result = await getConnection('https://grafana.example.com')

    expect(mockedDecryptString).toHaveBeenCalledTimes(2)
    expect(result?.gatToken).toBe(sampleTokens.gatToken)
    expect(result?.garToken).toBe(sampleTokens.garToken)
  })

  it('normalizes trailing slash when looking up', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        ...sampleTokens,
        encrypted: false,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    const result = await getConnection('https://grafana.example.com/')
    expect(result).not.toBeNull()
  })
})

describe('removeConnection', () => {
  it('removes the connection from the store', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        ...sampleTokens,
        encrypted: false,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    await removeConnection('https://grafana.example.com')

    const written = JSON.parse(mockedWriteFile.mock.calls[0]![1] as string) as {
      connections: Record<string, unknown>
    }
    expect(Object.keys(written.connections)).not.toContain(
      'https://grafana.example.com'
    )
  })

  it('normalizes trailing slash when removing', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        ...sampleTokens,
        encrypted: false,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    await removeConnection('https://grafana.example.com/')

    const written = JSON.parse(mockedWriteFile.mock.calls[0]![1] as string) as {
      connections: Record<string, unknown>
    }
    expect(Object.keys(written.connections)).toHaveLength(0)
  })

  it('does not fail when the URL is not in the store', async () => {
    mockedReadFile.mockRejectedValue(new Error('not found'))

    await expect(
      removeConnection('https://unknown.example.com')
    ).resolves.toBeUndefined()
  })
})

describe('getFirstStoredGrafanaUrl', () => {
  it('returns null when the store is empty', async () => {
    mockedReadFile.mockRejectedValue(new Error('not found'))

    const result = await getFirstStoredGrafanaUrl()
    expect(result).toBeNull()
  })

  it('returns the first stored URL', async () => {
    const store = makeStore({
      'https://grafana.example.com': {
        grafanaUrl: 'https://grafana.example.com',
        ...sampleTokens,
        encrypted: false,
      },
    })
    mockedReadFile.mockResolvedValue(store)

    const result = await getFirstStoredGrafanaUrl()
    expect(result).toBe('https://grafana.example.com')
  })
})
