/* eslint-disable @typescript-eslint/unbound-method */
import log from 'electron-log/main'
import { readFile, writeFile } from 'fs/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

vi.mock('fs/promises')

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

describe('initEventTracking', () => {
  const mockUserDataPath = '/mock/user/data'
  const mockInstallationIdFile = `${mockUserDataPath}/.installation_id`

  const mockedLog = vi.mocked(log)
  const mockedReadFile = vi.mocked(readFile)
  const mockedWriteFile = vi.mocked(writeFile)
  const mockedFetch = vi.mocked(fetch)

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'production'
    mockedWriteFile.mockReset()
  })

  describe('when installation id file exists', () => {
    it('should not send a request or create the file', async () => {
      mockedReadFile.mockResolvedValue('existing-installation-id')

      await initEventTracking()
      await new Promise(process.nextTick)

      expect(mockedReadFile).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'utf-8'
      )

      expect(mockedWriteFile).not.toHaveBeenCalled()
      expect(mockedFetch).not.toHaveBeenCalled()
      expect(mockedLog.error).not.toHaveBeenCalled()
    })
  })

  describe('when installation id file does not exist', () => {
    it('should create the file and send an event', async () => {
      mockedReadFile
        .mockRejectedValueOnce(new Error('File not found')) // installationIdExists check
        .mockResolvedValueOnce('test-uuid-123') // getInstallationId call from trackEvent

      mockedFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK',
      } as Response)

      await initEventTracking()

      expect(mockedReadFile).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'utf-8'
      )

      expect(mockedWriteFile).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      await new Promise(process.nextTick)

      expect(mockedFetch).toHaveBeenCalledWith(
        'MOCK_TRACKING_URL',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"event":"app_installed"') as string,
        })
      )

      expect(mockedFetch).toHaveBeenCalledTimes(1)
      expect(mockedLog.error).not.toHaveBeenCalled()
    })

    it('should log error if file creation fails', async () => {
      mockedReadFile.mockRejectedValue(new Error('File not found'))

      const writeError = new Error('Permission denied')
      mockedWriteFile.mockRejectedValue(writeError)

      await initEventTracking()
      await new Promise(process.nextTick)

      expect(mockedWriteFile).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      expect(mockedFetch).not.toHaveBeenCalled()

      expect(mockedLog.error).toHaveBeenCalledWith(
        'Error tracking installation:',
        writeError
      )
    })

    it('should log error if HTTP request fails', async () => {
      mockedReadFile
        .mockRejectedValueOnce(new Error('File not found')) // installationIdExists check
        .mockResolvedValueOnce('test-uuid-123') // getInstallationId call from trackEvent

      const fetchError = new Error('Network error')
      mockedFetch.mockRejectedValue(fetchError)

      await initEventTracking()

      expect(mockedWriteFile).toHaveBeenCalledWith(
        mockInstallationIdFile,
        'test-uuid-123'
      )

      await new Promise(process.nextTick)

      expect(mockedFetch).toHaveBeenCalled()

      expect(mockedLog.error).toHaveBeenCalledWith(
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

      expect(mockedReadFile).not.toHaveBeenCalled()
      expect(mockedWriteFile).not.toHaveBeenCalled()
      expect(mockedFetch).not.toHaveBeenCalled()
      expect(mockedLog.error).not.toHaveBeenCalled()
    })
  })
})
