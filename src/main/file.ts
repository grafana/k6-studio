import os from 'os'

import {
  K6_BROWSER_TEST_FILE_EXTENSION,
  K6_GENERATOR_FILE_EXTENSION,
} from '@/constants/files'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

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

  if (parsedPath.ext === '.js' || parsedPath.ext === '.ts') {
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

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
