import os from 'os'
import path from 'path'

import {
  RECORDINGS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
  DATA_FILES_PATH,
  BROWSER_TESTS_PATH,
} from '@/constants/workspace'
import { StudioFile } from '@/types'
import { exhaustive } from '@/utils/typescript'

function inferFileTypeFromExtension(
  filePath: string
): StudioFile['type'] | null {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.har':
      return 'recording'

    case '.k6g':
      return 'generator'

    case '.k6b':
      return 'browser-test'

    case '.js':
      return 'script'

    case '.json':
    case '.csv':
      return 'data-file'

    default:
      return null
  }
}

export function createStudioFile(filePath: string): StudioFile | null {
  const type = inferFileTypeFromExtension(filePath)

  if (type === null) {
    return null
  }

  const parsed = path.parse(filePath)

  return {
    type,
    path: filePath,
    fileName: parsed.base,
    displayName: parsed.name,
  }
}

export function getFilePath(
  file: Partial<StudioFile> & Pick<StudioFile, 'type' | 'fileName'>
): string {
  if ('path' in file && typeof file.path === 'string') {
    return file.path
  }
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
