import os from 'os'

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
import * as path from '@/utils/path'
import { exhaustive } from '@/utils/typescript'

export function getStudioFileFromPath(
  filePath: string
): StudioFile | undefined {
  const parsedPath = path.parse(filePath)

  const file = {
    displayName: parsedPath.name,
    fileName: parsedPath.base,
    path: filePath,
  }

  if (parsedPath.ext === '.har') {
    return {
      type: 'recording',
      ...file,
    }
  }

  if (parsedPath.ext === K6_BROWSER_TEST_FILE_EXTENSION) {
    return {
      type: 'browser-test',
      ...file,
    }
  }

  if (parsedPath.ext === K6_GENERATOR_FILE_EXTENSION) {
    return {
      type: 'generator',
      ...file,
    }
  }

  if (parsedPath.ext === '.js') {
    return {
      type: 'script',
      ...file,
    }
  }

  if (parsedPath.ext === '.json' || parsedPath.ext === '.csv') {
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
      return path.join(RECORDINGS_PATH, file.fileName)
    case 'generator':
      return path.join(GENERATORS_PATH, file.fileName)
    case 'browser-test':
      return path.join(BROWSER_TESTS_PATH, file.fileName)
    case 'script':
      return path.join(SCRIPTS_PATH, file.fileName)
    case 'data-file':
      return path.join(DATA_FILES_PATH, file.fileName)
    default:
      return exhaustive(file.type)
  }
}

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
