import * as pathe from 'pathe'

import { StudioFile } from '@/types'

import { getRoutePath } from '../routeMap'

/** Display name for a data file path (basename). Safe for UI in browser and Node. */
export function getDataFileDisplayName(filePath: string) {
  const base = filePath.replace(/^.*[/\\]/, '')
  return base || filePath
}

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()
}

export function getViewPath(path: string) {
  const encodedPath = encodeURIComponent(path)

  return getRoutePath('editorView', { path: encodedPath })
}

export function inferFileTypeFromExtension(
  filePath: string
): StudioFile['type'] {
  const ext = pathe.extname(filePath).toLowerCase()
  switch (ext) {
    case '.har':
      return 'recording'

    case '.k6g':
      return 'generator'

    case '.k6b':
      return 'browser-test'

    case '.js':
    case '.ts':
    case '.mjs':
    case '.cjs':
    case '.mts':
    case '.cts':
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
  const parsed = pathe.parse(filePath)

  return {
    type: inferFileTypeFromExtension(filePath),
    path: filePath,
    fileName: parsed.base,
    displayName: parsed.name,
  }
}
