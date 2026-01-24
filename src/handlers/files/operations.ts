import { BaseWindow, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

import {
  BROWSER_TESTS_PATH,
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from '@/constants/workspace'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { RecordingSchema } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { parseJsonAsSchema } from '@/utils/json'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import {
  BrowserTestContent,
  FileContent,
  FileOnDisk,
  HttpTestContent,
  OpenFile,
  RecordingContent,
  ScriptContent,
} from './types'

function trackGeneratorUpdated({ rules }: GeneratorFileData) {
  trackEvent({
    event: UsageEventName.GeneratorUpdated,
    payload: {
      rules: {
        correlation: rules.filter((rule) => rule.type === 'correlation').length,
        parameterization: rules.filter(
          (rule) => rule.type === 'parameterization'
        ).length,
        verification: rules.filter((rule) => rule.type === 'verification')
          .length,
        customCode: rules.filter((rule) => rule.type === 'customCode').length,
        disabled: rules.filter((rule) => !rule.enabled).length,
      },
    },
  })
}

function trackSave(file: OpenFile) {
  switch (file.content.type) {
    case 'recording':
      trackEvent({
        event: UsageEventName.RecordingCreated,
      })
      break

    case 'http-test':
      trackGeneratorUpdated(file.content.test)
      break

    case 'browser-test':
      trackEvent({
        event: UsageEventName.BrowserTestUpdated,
      })
      break

    case 'script':
      trackEvent({
        event: UsageEventName.ScriptExported,
      })
      break

    default:
      file.content satisfies never
      break
  }

  return file
}

function getBaseDirectoryForContentType(type: FileContent['type']): string {
  switch (type) {
    case 'recording':
      return RECORDINGS_PATH

    case 'http-test':
      return GENERATORS_PATH

    case 'browser-test':
      return BROWSER_TESTS_PATH

    case 'script':
      return SCRIPTS_PATH

    default:
      return type satisfies never
  }
}

function getFilePath({
  location,
  content,
}: OpenFile): Promise<string | undefined> {
  if (location.type === 'file-on-disk') {
    return Promise.resolve(location.path)
  }

  // TODO: Use a save dialog instead of auto-generating the path
  return Promise.resolve(getBaseDirectoryForContentType(content.type))
}

function serializeContent(content: FileContent): string {
  switch (content.type) {
    case 'recording':
      return JSON.stringify(
        proxyDataToHar(content.requests, content.browserEvents),
        null,
        2
      )

    case 'http-test':
      return JSON.stringify(content.test, null, 2)

    case 'browser-test':
      return JSON.stringify(content.test, null, 2)

    case 'script':
      return content.content

    default:
      return content satisfies never
  }
}

export async function saveFile(file: OpenFile): Promise<OpenFile> {
  const filePath = await getFilePath(file)

  if (filePath === undefined) {
    return file
  }

  const serializedContent = serializeContent(file.content)

  await writeFile(filePath, serializedContent, 'utf-8')

  trackSave(file)

  return {
    ...file,
    location: {
      type: 'file-on-disk',
      name: path.basename(filePath),
      path: filePath,
    },
  }
}

function inferTypeFromFileExtension(filePath: string): FileContent['type'] {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.har':
      return 'recording'

    case '.k6g':
      return 'http-test'

    case '.k6b':
      return 'browser-test'

    case '.js':
    case '.ts':
      return 'script'

    default:
      throw new Error(`Files with extension ${ext} are not supported.`)
  }
}

interface ParseFileOptions {
  type: FileContent['type']
  data: string
}

function parseRecordingContent({ data }: ParseFileOptions): RecordingContent {
  const result = parseJsonAsSchema(data, RecordingSchema)

  if (!result.success) {
    throw new Error('Failed to parse recording file content.')
  }

  return {
    type: 'recording',
    requests: harToProxyData(result.data),
    browserEvents: result.data.log._browserEvents?.events ?? [],
  }
}

function parseHttpTestContent({ data }: ParseFileOptions): HttpTestContent {
  const result = parseJsonAsSchema(data, GeneratorFileDataSchema)

  if (!result.success) {
    throw new Error('Failed to parse HTTP test file content.')
  }

  return {
    type: 'http-test',
    test: result.data,
  }
}

function parseBrowserTestContent({
  data,
}: ParseFileOptions): BrowserTestContent {
  const result = parseJsonAsSchema(data, BrowserTestFileSchema)

  if (!result.success) {
    throw new Error('Failed to parse browser test file content.')
  }

  return {
    type: 'browser-test',
    test: result.data,
  }
}

function parseScriptContent({ data }: ParseFileOptions): ScriptContent {
  return {
    type: 'script',
    content: data,
  }
}

function parseFileContent(options: ParseFileOptions): FileContent {
  switch (options.type) {
    case 'recording':
      return parseRecordingContent(options)

    case 'http-test':
      return parseHttpTestContent(options)

    case 'browser-test':
      return parseBrowserTestContent(options)

    case 'script':
      return parseScriptContent(options)

    default:
      return options.type satisfies never
  }
}

async function selectFromDialog(
  window: BaseWindow
): Promise<string | undefined> {
  const {
    filePaths: [filePath],
  } = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [
      { name: 'All Supported', extensions: ['har', 'k6g', 'k6b', 'js', 'ts'] },
    ],
  })

  return filePath
}

export async function openFile(
  window: BaseWindow,
  knownPath?: string,
  expectedType?: FileContent['type']
): Promise<OpenFile<FileOnDisk> | null> {
  const filePath = knownPath ?? (await selectFromDialog(window))

  if (filePath === undefined) {
    return null
  }

  const type = expectedType ?? inferTypeFromFileExtension(filePath)

  const absolute = path.isAbsolute(filePath)

  if (!absolute) {
    console.log('Found non-relative path in open:', filePath)
  }

  const resolvedPath = !absolute
    ? path.join(getBaseDirectoryForContentType(type), filePath)
    : filePath

  const data = await readFile(resolvedPath, 'utf-8')
  const content = parseFileContent({ type, data })

  return {
    location: {
      type: 'file-on-disk',
      name: path.basename(resolvedPath),
      path: resolvedPath,
    },
    content,
  }
}
