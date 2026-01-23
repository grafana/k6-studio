import os from 'os'
import path from 'path'

import {
  K6_BROWSER_TEST_FILE_EXTENSION,
  K6_GENERATOR_FILE_EXTENSION,
} from '@/constants/files'
import { StudioFile } from '@/types'

export function inferStudioFileFromPath(
  filePath: string
): StudioFile | undefined {
  const file = {
    displayName: path.parse(filePath).name,
    fileName: path.basename(filePath),
    filePath,
  }

  if (path.extname(filePath) === '.har') {
    return {
      type: 'recording',
      ...file,
    }
  }

  if (path.extname(filePath) === K6_BROWSER_TEST_FILE_EXTENSION) {
    return {
      type: 'browser-test',
      ...file,
    }
  }

  if (path.extname(filePath) === K6_GENERATOR_FILE_EXTENSION) {
    return {
      type: 'generator',
      ...file,
    }
  }

  if (path.extname(filePath) === '.js') {
    return {
      type: 'script',
      ...file,
    }
  }

  if (path.extname(filePath) === '.json' || path.extname(filePath) === '.csv') {
    return {
      type: 'data-file',
      ...file,
    }
  }
}

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
