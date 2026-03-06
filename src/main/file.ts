import os from 'os'
import path from 'path'

import { StudioFile } from '@/types'

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

export function expandHomeDir(inputPath?: string) {
  if (!inputPath) return inputPath
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(1))
  }
  return inputPath
}
