import { BaseWindow, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import * as path from 'pathe'

import {
  BROWSER_TESTS_PATH,
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
} from '@/constants/workspace'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { RecordingSchema } from '@/schemas/recording'
import { GeneratorFileData } from '@/types/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { parseJsonAsSchema } from '@/utils/json'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import { trackFileSaved } from './tracking'
import {
  BrowserTestContent,
  FileContent,
  FileOnDisk,
  HttpTestContent,
  OpenFile,
  RecordingContent,
  ScriptContent,
} from './types'

function makeRelativeToFile(
  baseFilePath: string,
  targetFilePath: string
): string {
  return path.relative(path.dirname(baseFilePath), targetFilePath)
}

function makeAbsoluteFromFile(
  baseFilePath: string,
  relativePath: string
): string {
  return path.resolve(path.dirname(baseFilePath), relativePath)
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

function getFileLocation({
  location,
  content,
}: OpenFile): Promise<FileOnDisk | undefined> {
  if (location.type === 'file-on-disk') {
    return Promise.resolve(location)
  }

  // TODO: Use a save dialog instead of auto-generating the path
  const path = getBaseDirectoryForContentType(content.type)

  const fileLocation: FileOnDisk = {
    type: 'file-on-disk',
    name: location.name,
    path: path,
  }

  return Promise.resolve(fileLocation)
}

function serializeHttpTest(
  location: FileOnDisk,
  { test }: HttpTestContent
): string {
  const normalizedGenerator: GeneratorFileData = {
    ...test,
    recordingPath:
      test.recordingPath &&
      makeRelativeToFile(location.path, test.recordingPath),
    testData: {
      ...test.testData,
      files: test.testData.files.map((file) => {
        return {
          ...file,
          name: makeRelativeToFile(location.path, file.name),
        }
      }),
    },
  }

  return JSON.stringify(normalizedGenerator, null, 2)
}

function serializeContent(file: OpenFile<FileOnDisk>): string {
  switch (file.content.type) {
    case 'recording':
      return JSON.stringify(
        proxyDataToHar(file.content.requests, file.content.browserEvents),
        null,
        2
      )

    case 'http-test':
      return serializeHttpTest(file.location, file.content)

    case 'browser-test':
      return JSON.stringify(file.content.test, null, 2)

    case 'script':
      return file.content.script

    default:
      return file.content satisfies never
  }
}

export async function saveFile(file: OpenFile): Promise<OpenFile> {
  const location = await getFileLocation(file)

  if (location === undefined) {
    return file
  }

  const newFile = {
    ...file,
    location,
  }

  const serializedContent = serializeContent(newFile)

  await writeFile(location.path, serializedContent, 'utf-8')

  trackFileSaved(newFile)

  return newFile
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
  path: string
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

function parseHttpTestContent({
  path,
  data,
}: ParseFileOptions): HttpTestContent {
  const { success, data: test } = parseJsonAsSchema(
    data,
    GeneratorFileDataSchema
  )

  if (!success) {
    throw new Error('Failed to parse HTTP test file content.')
  }

  return {
    type: 'http-test',
    test: {
      ...test,
      recordingPath:
        test.recordingPath && makeAbsoluteFromFile(path, test.recordingPath),
      testData: {
        ...test.testData,
        files: test.testData.files.map((file) => {
          return {
            ...file,
            name: makeAbsoluteFromFile(path, file.name),
          }
        }),
      },
    },
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
    script: data,
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
    console.warn('Found non-relative path in open:', filePath)
  }

  const resolvedPath = !absolute
    ? path.join(getBaseDirectoryForContentType(type), filePath)
    : filePath

  const data = await readFile(resolvedPath, 'utf-8')

  const content = parseFileContent({
    type,
    path: resolvedPath,
    data,
  })

  return {
    location: {
      type: 'file-on-disk',
      name: path.basename(resolvedPath),
      path: resolvedPath,
    },
    content,
  }
}
