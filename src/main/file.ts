import os from 'os'
import path from 'path'

import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  DATA_FILES_PATH,
} from '@/constants/workspace'
import { StudioFile } from '@/types'
import { exhaustive } from '@/utils/typescript'

export function getStudioFileFromPath(
  filePath: string
): StudioFile | undefined {
  const file = {
    displayName: path.parse(filePath).name,
    fileName: path.basename(filePath),
  }

  if (
    filePath.startsWith(RECORDINGS_PATH) &&
    path.extname(filePath) === '.har'
  ) {
    return {
      type: 'recording',
      ...file,
    }
  }

  if (
    filePath.startsWith(GENERATORS_PATH) &&
    path.extname(filePath) === '.k6g'
  ) {
    return {
      type: 'generator',
      ...file,
    }
  }

  if (filePath.startsWith(SCRIPTS_PATH) && path.extname(filePath) === '.js') {
    return {
      type: 'script',
      ...file,
    }
  }

  if (
    filePath.startsWith(DATA_FILES_PATH) &&
    (path.extname(filePath) === '.json' || path.extname(filePath) === '.csv')
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
      return path.join(RECORDINGS_PATH, file.fileName)
    case 'generator':
      return path.join(GENERATORS_PATH, file.fileName)
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
