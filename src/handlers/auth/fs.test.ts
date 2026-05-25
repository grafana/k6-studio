import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Profile } from '@/schemas/profile'

const mockEncryptString = vi.fn((value: string) => `encrypted:${value}`)
const mockDecryptString = vi.fn((value: string) => {
  if (!value.startsWith('encrypted:')) {
    throw new Error('Decryption failed')
  }
  return value.replace('encrypted:', '')
})
const mockIsEncryptionAvailable = vi.fn(() => true)

const mockReadFile = vi.fn()
const mockWriteFile = vi.fn()

vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/k6-studio-test',
  },
}))

vi.mock('electron-log/main', () => ({
  default: { warn: vi.fn() },
}))

vi.mock('@/main/encryption', () => ({
  encryptString: mockEncryptString,
  decryptString: mockDecryptString,
  isEncryptionAvailable: mockIsEncryptionAvailable,
}))

vi.mock('@/utils/fs', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}))

const testProfile: Profile = {
  version: '1.0',
  tokens: {
    'stack-1': 'token-abc',
    'stack-2': 'token-def',
  },
  profiles: {
    currentStack: 'stack-1',
    stacks: {
      'stack-1': {
        id: 'stack-1',
        url: 'https://stack-1.grafana.net',
        name: 'Stack 1',
        user: { name: 'Test User', email: 'test@test.com', username: null },
      },
    },
  },
}

describe('saveProfileData', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockEncryptString.mockImplementation(
      (value: string) => `encrypted:${value}`
    )
    mockDecryptString.mockImplementation((value: string) => {
      if (!value.startsWith('encrypted:')) {
        throw new Error('Decryption failed')
      }
      return value.replace('encrypted:', '')
    })
    mockIsEncryptionAvailable.mockReturnValue(true)
    mockWriteFile.mockResolvedValue(undefined)
    mockReadFile.mockResolvedValue(JSON.stringify(testProfile))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('encrypts each token value before writing when encryption is available', async () => {
    const { saveProfileData } = await import('./fs')

    await saveProfileData(testProfile)

    expect(mockEncryptString).toHaveBeenCalledWith('token-abc')
    expect(mockEncryptString).toHaveBeenCalledWith('token-def')

    const writtenJson = mockWriteFile.mock.calls[0]?.[1] as string
    const writtenData = JSON.parse(writtenJson) as Profile
    expect(writtenData.tokens['stack-1']).toBe('encrypted:token-abc')
    expect(writtenData.tokens['stack-2']).toBe('encrypted:token-def')
  })

  it('writes file with mode 0o600', async () => {
    const { saveProfileData } = await import('./fs')

    await saveProfileData(testProfile)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { mode: 0o600 }
    )
  })

  it('clears cache so next read re-fetches from disk', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        ...testProfile,
        tokens: {
          'stack-1': 'encrypted:token-abc',
          'stack-2': 'encrypted:token-def',
        },
      })
    )

    const { getProfileData, saveProfileData } = await import('./fs')

    await getProfileData()
    expect(mockReadFile).toHaveBeenCalledTimes(1)

    await saveProfileData(testProfile)

    await getProfileData()
    expect(mockReadFile).toHaveBeenCalledTimes(2)
  })

  it('writes plaintext tokens when encryption is unavailable', async () => {
    mockIsEncryptionAvailable.mockReturnValue(false)

    const { saveProfileData } = await import('./fs')

    await saveProfileData(testProfile)

    expect(mockEncryptString).not.toHaveBeenCalled()

    const writtenJson = mockWriteFile.mock.calls[0]?.[1] as string
    const writtenData = JSON.parse(writtenJson) as Profile
    expect(writtenData.tokens['stack-1']).toBe('token-abc')
    expect(writtenData.tokens['stack-2']).toBe('token-def')
  })
})

describe('getProfileData', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockEncryptString.mockImplementation(
      (value: string) => `encrypted:${value}`
    )
    mockDecryptString.mockImplementation((value: string) => {
      if (!value.startsWith('encrypted:')) {
        throw new Error('Decryption failed')
      }
      return value.replace('encrypted:', '')
    })
    mockIsEncryptionAvailable.mockReturnValue(true)
    mockWriteFile.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads and decrypts token values', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        ...testProfile,
        tokens: {
          'stack-1': 'encrypted:token-abc',
          'stack-2': 'encrypted:token-def',
        },
      })
    )

    const { getProfileData } = await import('./fs')

    const result = await getProfileData()

    expect(mockDecryptString).toHaveBeenCalledWith('encrypted:token-abc')
    expect(mockDecryptString).toHaveBeenCalledWith('encrypted:token-def')
    expect(result.tokens['stack-1']).toBe('token-abc')
    expect(result.tokens['stack-2']).toBe('token-def')
  })

  it('falls back to raw value when decryptString throws (plaintext migration)', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(testProfile))

    const { getProfileData } = await import('./fs')

    const result = await getProfileData()

    expect(result.tokens['stack-1']).toBe('token-abc')
    expect(result.tokens['stack-2']).toBe('token-def')
  })

  it('returns default profile when file does not exist', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'))

    const { getProfileData } = await import('./fs')

    const result = await getProfileData()

    expect(result).toEqual({
      version: '1.0',
      tokens: {},
      profiles: {
        currentStack: '',
        stacks: {},
      },
    })
  })

  it('caches result on second call', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        ...testProfile,
        tokens: {
          'stack-1': 'encrypted:token-abc',
        },
      })
    )

    const { getProfileData } = await import('./fs')

    await getProfileData()
    await getProfileData()

    expect(mockReadFile).toHaveBeenCalledTimes(1)
  })
})
