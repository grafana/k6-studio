import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile } from 'fs/promises'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { getFilePath } from '@/main/file'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { RecordingSchema } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEvent, UsageEventName } from '@/services/usageTracking/types'
import { K6Client } from '@/utils/k6/client'
import { exhaustive } from '@/utils/typescript'
import { isExternalScript } from '@/utils/workspace'

import {
  FileContent,
  FileContentType,
  FileHandler,
  FileLocation,
  OpenFileRequest,
  OpenFileResult,
  SaveFilePayload,
} from './types'

export function initialize() {
  ipcMain.handle(
    FileHandler.Save,
    async (_event, { content, location }: SaveFilePayload) => {
      console.info(`${FileHandler.Save} event received`)

      try {
        const filePath = resolveFileLocation(content.type, location)
        const serialized = serializeContent(content)

        await writeFile(filePath, serialized)

        trackSaveFile(content)
      } catch (error) {
        log.error(error)

        throw error
      }
    }
  )

  ipcMain.handle(
    FileHandler.Open,
    async (_event, request: OpenFileRequest): Promise<OpenFileResult> => {
      console.info(`${FileHandler.Open} event received`)

      const filePath = resolveFileLocation(request.fileType, request.location)
      const raw = await readFile(filePath, { encoding: 'utf-8', flag: 'r' })

      return parseOpenResult(filePath, request.fileType, raw)
    }
  )
}

function resolveFileLocation(
  fileType: FileContentType,
  location: FileLocation
): string {
  switch (location.type) {
    case 'path':
      return location.path

    case 'legacy': {
      invariant(
        !INVALID_FILENAME_CHARS.test(location.name),
        'Invalid file name'
      )
      return getFilePath({
        type: fileType,
        fileName: location.name,
      })
    }

    case 'new':
      throw new Error('Files with location "new" are not supported')

    default:
      return exhaustive(location)
  }
}

async function parseOpenResult(
  filePath: string,
  fileType: FileContentType,
  raw: string
): Promise<OpenFileResult> {
  switch (fileType) {
    case 'generator': {
      const data = GeneratorFileDataSchema.parse(JSON.parse(raw))

      return { type: 'generator', data }
    }

    case 'browser-test': {
      const data = BrowserTestFileSchema.parse(JSON.parse(raw))

      return { type: 'browser-test', data }
    }

    case 'recording': {
      const data = RecordingSchema.parse(JSON.parse(raw))

      return { type: 'recording', data }
    }

    case 'script': {
      const options = await new K6Client()
        .inspect({ scriptPath: filePath })
        .catch(() => ({}))

      return {
        type: 'script',
        content: raw,
        options: options ?? {},
        isExternal: isExternalScript(filePath),
      }
    }

    default:
      return exhaustive(fileType)
  }
}

function serializeContent(content: FileContent): string {
  switch (content.type) {
    case 'generator':
    case 'browser-test':
    case 'recording':
      return JSON.stringify(content.data, null, 2)

    case 'script':
      return content.content

    default:
      return exhaustive(content)
  }
}

function trackSaveFile(content: FileContent) {
  const trackingEvent = getTrackingEvent(content)

  if (trackingEvent === null) {
    return
  }

  trackEvent(trackingEvent)
}

function getTrackingEvent(content: FileContent): UsageEvent | null {
  switch (content.type) {
    case 'generator':
      return {
        event: UsageEventName.GeneratorUpdated,
        payload: {
          rules: {
            correlation: content.data.rules.filter(
              (rule) => rule.type === 'correlation'
            ).length,
            parameterization: content.data.rules.filter(
              (rule) => rule.type === 'parameterization'
            ).length,
            verification: content.data.rules.filter(
              (rule) => rule.type === 'verification'
            ).length,
            customCode: content.data.rules.filter(
              (rule) => rule.type === 'customCode'
            ).length,
            disabled: content.data.rules.filter((rule) => !rule.enabled).length,
          },
        },
      }

    case 'browser-test':
      return {
        event: UsageEventName.BrowserTestUpdated,
      }

    case 'script':
      return {
        event: UsageEventName.ScriptExported,
      }

    case 'recording':
      return null

    default:
      return content satisfies never
  }
}
