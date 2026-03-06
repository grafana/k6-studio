import { SupportedFileType } from '@/types'

import { getRoutePath } from '../routeMap'

import { exhaustive } from './typescript'

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

export function getViewPath(type: SupportedFileType, path: string) {
  const encodedPath = encodeURIComponent(path)

  switch (type) {
    case 'recording':
      return getRoutePath('editorView', { path: encodedPath })

    case 'generator':
      return getRoutePath('generator', { path: encodedPath })

    case 'browser-test':
      return getRoutePath('browserTestEditor', { path: encodedPath })

    case 'script':
      return getRoutePath('validator', { path: encodedPath })

    case 'json':
    case 'csv':
      return getRoutePath('dataFilePreviewer', { path: encodedPath })

    default:
      return exhaustive(type)
  }
}
