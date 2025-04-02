import { StudioFileType } from '@/types'

import { getRoutePath } from '../routeMap'

import { exhaustive } from './typescript'

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()
}

export function getViewPath(type: StudioFileType, fileName: string) {
  const encodedFileName = encodeURIComponent(fileName)

  switch (type) {
    case 'recording':
      return getRoutePath('recordingPreviewer', { fileName: encodedFileName })

    case 'generator':
      return getRoutePath('generator', { fileName: encodedFileName })

    case 'script':
      return getRoutePath('validator', { fileName: encodedFileName })

    case 'data-file':
      return getRoutePath('dataFilePreviewer', { fileName: encodedFileName })

    default:
      return exhaustive(type)
  }
}
