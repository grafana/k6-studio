import os from 'os'
import path from 'path'

import { StudioFile } from '@/types'

export function inferFileTypeFromExtension(
  filePath: string
): StudioFile['type'] {
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
      return 'json'

    case '.csv':
      return 'csv'

    default:
      return 'unsupported'
  }
}

export function createStudioFile(filePath: string): StudioFile {
  const parsed = path.parse(filePath)

  return {
    type: inferFileTypeFromExtension(filePath),
    path: filePath,
    fileName: parsed.base,
    displayName: parsed.name,
  }
}

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
