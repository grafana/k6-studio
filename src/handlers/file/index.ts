import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { readFile, writeFile } from 'fs/promises'
import { parse as parseCSV } from 'papaparse'
import path from 'path'
import { EntryInfo, readdirp, ReaddirpOptions } from 'readdirp'

import { isIgnoredSystemFile } from '@/constants/files'
import { TEMP_PATH } from '@/constants/workspace'
import { createStudioFile, inferFileTypeFromExtension } from '@/main/file'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { RecordingSchema } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEvent, UsageEventName } from '@/services/usageTracking/types'
import { SupportedFileType } from '@/types'
import { DataRecord } from '@/types/testData'
import { browserWindowFromEvent } from '@/utils/electron'
import { harToProxyData } from '@/utils/harToProxyData'
import { JsonObject } from '@/utils/json'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { exhaustive } from '@/utils/typescript'
import { Workspace } from '@/utils/workspace'

import {
  type DirectoryEntry,
  FileContent,
  FileHandler,
  GetTempPathArgs,
  type ListDirectoryArgs,
  OpenFileResult,
  SaveFilePayload,
} from './types'
import { resolveFileLocation } from './utils'

export function initialize() {
  ipcMain.handle(
    FileHandler.Save,
    async (_event, { content, location }: SaveFilePayload): Promise<string> => {
      console.info(`${FileHandler.Save} event received`)

      try {
        const filePath = resolveFileLocation(content.type, location)
        const serialized = serializeContent(content, filePath)

        await writeFile(filePath, serialized)

        trackSaveFile(content)

        return filePath
      } catch (error) {
        log.error(error)

        throw error
      }
    }
  )

  ipcMain.handle(
    FileHandler.Open,
    async (event, path: string): Promise<OpenFileResult> => {
      console.info(`${FileHandler.Open} event received`)

      const browserWindow = browserWindowFromEvent(event)

      const fileType = inferFileTypeFromExtension(path)

      if (fileType === null) {
        return { type: 'unsupported-format' }
      }

      const raw = await readFile(path, {
        encoding: 'utf-8',
        flag: 'r',
      })

      return parseOpenResult(browserWindow.workspace, path, fileType, raw)
    }
  )

  ipcMain.handle(
    FileHandler.GetTempPath,
    (_event, { prefix = 'k6s', extension }: GetTempPathArgs = {}): string => {
      const ext = extension?.replace(/^\.?/, '.') ?? ''
      const basename = `${prefix}-${crypto.randomUUID()}${ext}`

      return path.join(TEMP_PATH, basename)
    }
  )

  ipcMain.handle(
    FileHandler.ListDirectory,
    async (
      event,
      { path: requestedPath }: ListDirectoryArgs
    ): Promise<DirectoryEntry[]> => {
      console.info(`${FileHandler.ListDirectory} event received`)

      const browserWindow = browserWindowFromEvent(event)
      const workspacePath = browserWindow.workspace.path

      const resolvedPath = path.resolve(requestedPath)
      const relativePath = path.relative(workspacePath, resolvedPath)

      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error('Path is outside workspace')
      }

      const options: Partial<ReaddirpOptions> = {
        depth: 0,
        type: 'all',
        directoryFilter: (entry: { basename: string }) => {
          return entry.basename !== 'node_modules'
        },
        fileFilter: (entry: { basename: string }) => {
          return !isIgnoredSystemFile(entry.basename)
        },
      }

      const entries: DirectoryEntry[] = []

      for await (const entry of readdirp(
        resolvedPath,
        options
      ) as AsyncIterable<EntryInfo>) {
        const fullPath = entry.fullPath

        if (entry.dirent === undefined) {
          continue
        }

        if (entry.dirent.isDirectory()) {
          entries.push({
            type: 'directory',
            basename: entry.basename,
            path: fullPath,
          })

          continue
        }

        entries.push({
          type: 'file',
          basename: entry.basename,
          path: fullPath,
          file: createStudioFile(fullPath),
        })
      }

      const sortEntries = (a: DirectoryEntry, b: DirectoryEntry) => {
        const aIsDir = a.type === 'directory'
        const bIsDir = b.type === 'directory'
        if (aIsDir !== bIsDir) {
          return aIsDir ? -1 : 1
        }
        return a.basename.localeCompare(b.basename, undefined, {
          sensitivity: 'base',
        })
      }

      return entries.sort(sortEntries)
    }
  )
}

async function parseOpenResult(
  workspace: Workspace,
  filePath: string,
  fileType: SupportedFileType,
  raw: string
): Promise<OpenFileResult> {
  switch (fileType) {
    case 'generator': {
      const data = GeneratorFileDataSchema.parse(JSON.parse(raw))
      const generatorDir = path.dirname(filePath)

      const absoluteRecordingPath =
        data.recordingPath !== ''
          ? path.resolve(generatorDir, data.recordingPath)
          : ''

      const absoluteFiles = data.testData.files.map((file) => {
        return {
          path: file.path !== '' ? path.resolve(generatorDir, file.path) : '',
        }
      })

      const absoluteRules = data.rules.map((rule) => {
        if (
          rule.type === 'parameterization' &&
          rule.value.type === 'dataFileValue' &&
          rule.value.fileName !== ''
        ) {
          return {
            ...rule,
            value: {
              ...rule.value,
              fileName: path.resolve(generatorDir, rule.value.fileName),
            },
          }
        }
        return rule
      })

      return {
        type: 'generator',
        data: {
          ...data,
          recordingPath: absoluteRecordingPath,
          testData: { ...data.testData, files: absoluteFiles },
          rules: absoluteRules,
        },
      }
    }

    case 'browser-test': {
      const data = BrowserTestFileSchema.parse(JSON.parse(raw))

      return { type: 'browser-test', data }
    }

    case 'recording': {
      const har = RecordingSchema.parse(JSON.parse(raw))
      const requests = harToProxyData(har)
      const browserEvents = har.log._browserEvents?.events ?? []

      return {
        type: 'recording',
        data: { requests, browserEvents },
      }
    }

    case 'script':
      return {
        type: 'script',
        content: raw,
        isExternal: !workspace.isInside(filePath),
      }

    case 'json': {
      // We should use zod to parse the json, so that we know that the format is correct.
      const parsed = JSON.parse(raw) as JsonObject | JsonObject[]
      const array = Array.isArray(parsed) ? parsed : [parsed]

      return {
        type: 'json',
        props: array[0] ? Object.keys(array[0]) : [],
        data: array.slice(0, 20),
        total: array.length,
      }
    }

    case 'csv': {
      const parsed = parseCSV<DataRecord>(raw, {
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
      })

      return {
        type: 'csv',
        props: parsed.meta.fields ?? [],
        data: parsed.data.slice(0, 20),
        total: parsed.data.length,
      }
    }

    default:
      return exhaustive(fileType)
  }
}

function serializeContent(content: FileContent, filePath: string): string {
  switch (content.type) {
    case 'generator': {
      const generatorDir = path.dirname(filePath)

      const relativeRecordingPath =
        content.data.recordingPath !== ''
          ? path.relative(generatorDir, content.data.recordingPath)
          : ''

      const relativeFiles = content.data.testData.files.map((file) => {
        return {
          path: file.path !== '' ? path.relative(generatorDir, file.path) : '',
        }
      })

      const relativeRules = content.data.rules.map((rule) => {
        if (
          rule.type === 'parameterization' &&
          rule.value.type === 'dataFileValue' &&
          rule.value.fileName !== ''
        ) {
          return {
            ...rule,
            value: {
              ...rule.value,
              fileName: path.relative(generatorDir, rule.value.fileName),
            },
          }
        }
        return rule
      })

      const dataToWrite = {
        ...content.data,
        recordingPath: relativeRecordingPath,
        testData: { ...content.data.testData, files: relativeFiles },
        rules: relativeRules,
      }
      return JSON.stringify(dataToWrite, null, 2)
    }

    case 'browser-test':
      return JSON.stringify(content.data, null, 2)

    case 'recording': {
      const har = proxyDataToHar(
        content.data.requests,
        content.data.browserEvents
      )
      return JSON.stringify(har, null, 2)
    }

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
