/* eslint-disable @typescript-eslint/unbound-method */
import log from 'electron-log/main'
import { readFile, writeFile } from 'fs/promises'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { initEventTracking } from './index'

vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => '1.0.0'),
  },
}))

vi.mock('electron-log/main', () => ({
  default: {
    error: vi.fn(),
  },
}))

const { mockReadFile, mockWriteFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
}))

vi.mock('fs/promises', () => {
  return {
    default: { readFile: mockReadFile, writeFile: mockWriteFile },
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  }
})

vi.mock('@/utils/electron', () => ({
  getArch: vi.fn(() => 'x64'),
  getPlatform: vi.fn(() => 'mac'),
}))

vi.mock('@/utils/uuid', () => ({
  uuid: vi.fn(() => 'test-uuid-123'),
}))

vi.mock('@/handlers/auth/fs', () => ({
  getProfileData: vi.fn(() => ({ profiles: { stacks: { a: {} } } })),
}))

vi.mock('@/constants/usage', () => ({
  TRACKING_URL: 'MOCK_TRACKING_URL',
  INSTALLATION_ID_FILE: '/mock/user/data/.installation_id',
}))

global.fetch = vi.fn()

global.k6StudioState = {
  appSettings: {
    telemetry: {
      usageReport: true,
    },
  },
} as typeof global.k6StudioState

const mockUserDataPath = '/mock/user/data'
const mockInstallationIdFile = `${mockUserDataPath}/.installation_id`

describe('initEventTracking', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NODE_ENV = 'production'
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('when installation id file exists', () => {
    it('should not send a request or create the file', async () => {
      vi.mocked(readFile).mockResolvedValue('existing-installation-id')

      await initEventTracking()
      await new Promise(process.nextTick)

      expect(vi.mocked(readFile)).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'utf-8'
      )

      expect(vi.mocked(writeFile)).not.toHaveBeenCalled()
      expect(vi.mocked(fetch)).not.toHaveBeenCalled()
      expect(vi.mocked(log).error).not.toHaveBeenCalled()
    })
  })

  describe('when installation id file does not exist', () => {
    it('should create the file and send an event', async () => {
      vi.mocked(readFile)
        .mockRejectedValueOnce(new Error('File not found')) // installationIdExists check
        .mockResolvedValueOnce('test-uuid-123') // getInstallationId call from trackEvent

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        statusText: 'OK',
      } as Response)

      await initEventTracking()

      expect(vi.mocked(readFile)).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'utf-8'
      )

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      await new Promise(process.nextTick)

      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        'MOCK_TRACKING_URL',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"event":"app_installed"') as string,
        })
      )

      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(log).error).not.toHaveBeenCalled()
    })

    it('should log error if file creation fails', async () => {
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'))

      const writeError = new Error('Permission denied')
      vi.mocked(writeFile).mockRejectedValue(writeError)

      await initEventTracking()
      await new Promise(process.nextTick)

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      expect(vi.mocked(fetch)).not.toHaveBeenCalled()

      expect(vi.mocked(log).error).toHaveBeenCalledWith(
        'Error tracking installation:',
        writeError
      )
    })

    it('should log error if HTTP request fails', async () => {
      vi.mocked(readFile)
        .mockRejectedValueOnce(new Error('File not found')) // installationIdExists check
        .mockResolvedValueOnce('test-uuid-123') // getInstallationId call from trackEvent

      const fetchError = new Error('Network error')
      vi.mocked(fetch).mockRejectedValue(fetchError)

      await initEventTracking()

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      await new Promise(process.nextTick)

      expect(vi.mocked(fetch)).toHaveBeenCalled()

      expect(vi.mocked(log).error).toHaveBeenCalledWith(
        'Failed to send usage statistic event:',
        fetchError
      )
    })
  })

  describe('in development environment', () => {
    it('should return early and not perform any operations', async () => {
      process.env.NODE_ENV = 'development'

      await initEventTracking()
      await new Promise(process.nextTick)

      expect(vi.mocked(readFile)).not.toHaveBeenCalled()
      expect(vi.mocked(writeFile)).not.toHaveBeenCalled()
      expect(vi.mocked(fetch)).not.toHaveBeenCalled()
      expect(vi.mocked(log).error).not.toHaveBeenCalled()
    })
  })
})
