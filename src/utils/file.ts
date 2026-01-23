import { StudioFile } from '@/types'

import { getRoutePath } from '../routeMap'

import { exhaustive } from './typescript'

export function getStudioFileFromPath(
  type: StudioFile['type'],
  filePath: string
): StudioFile {
  const fileName = filePath.slice(filePath.lastIndexOf('/') + 1)

  return {
    type,
    displayName: getFileNameWithoutExtension(fileName),
    fileName,
    filePath,
  }
}

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()
}

export function getViewPath(file: StudioFile) {
  const encodedFileName = encodeURIComponent(file.filePath)

  switch (file.type) {
    case 'recording':
      return getRoutePath('recordingPreviewer', { fileName: encodedFileName })

    case 'generator':
      return getRoutePath('generator', { fileName: encodedFileName })

    case 'browser-test':
      return getRoutePath('browserTestEditor', { fileName: encodedFileName })

    case 'script':
      return getRoutePath('validator', { fileName: encodedFileName })

    case 'data-file':
      return getRoutePath('dataFilePreviewer', { fileName: encodedFileName })

    default:
      return exhaustive(file.type)
  }
}
