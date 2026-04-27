import os from 'os'
import * as pathe from 'pathe'

import {
  K6_BROWSER_TEST_FILE_EXTENSION,
  K6_GENERATOR_FILE_EXTENSION,
} from '@/constants/files'
import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
} from '@/constants/workspace'
import { StudioFile } from '@/types'
import { exhaustive } from '@/utils/typescript'

export function getStudioFileFromPath(
  filePath: string
): StudioFile | undefined {
  const normalizedPath = pathe.normalize(filePath)
  const parsed = pathe.parse(normalizedPath)
  const file = {
    displayName: parsed.name,
    fileName: parsed.base,
    path: normalizedPath,
  }

  if (
    normalizedPath.startsWith(pathe.normalize(RECORDINGS_PATH)) &&
    parsed.ext === '.har'
  ) {
    return {
      type: 'recording',
      ...file,
    }
  }

  if (
    normalizedPath.startsWith(pathe.normalize(BROWSER_TESTS_PATH)) &&
    parsed.ext === K6_BROWSER_TEST_FILE_EXTENSION
  ) {
    return {
      type: 'browser-test',
      ...file,
    }
  }

  if (
    normalizedPath.startsWith(pathe.normalize(GENERATORS_PATH)) &&
    parsed.ext === K6_GENERATOR_FILE_EXTENSION
  ) {
    return {
      type: 'generator',
      ...file,
    }
  }

  if (
    normalizedPath.startsWith(pathe.normalize(SCRIPTS_PATH)) &&
    parsed.ext === '.js'
  ) {
    return {
      type: 'script',
      ...file,
    }
  }

  if (
    normalizedPath.startsWith(pathe.normalize(DATA_FILES_PATH)) &&
    (parsed.ext === '.json' || parsed.ext === '.csv')
  ) {
    return {
      type: 'data-file',
      ...file,
    }
  }
}

export function getFilePath(
  file: Partial<StudioFile> & Pick<StudioFile, 'type' | 'fileName'>
) {
  switch (file.type) {
    case 'recording':
      return pathe.join(RECORDINGS_PATH, file.fileName)
    case 'generator':
      return pathe.join(GENERATORS_PATH, file.fileName)
    case 'browser-test':
      return pathe.join(BROWSER_TESTS_PATH, file.fileName)
    case 'script':
      return pathe.join(SCRIPTS_PATH, file.fileName)
    case 'data-file':
      return pathe.join(DATA_FILES_PATH, file.fileName)
    default:
      return exhaustive(file.type)
  }
}

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return pathe.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
