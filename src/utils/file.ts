import { getRoutePath } from '../routeMap'
import { StudioFileType } from '@/types'
import { exhaustive } from './typescript'

export function generateFileNameWithTimestamp(
  extension: string,
  prefix?: string
) {
  const timestamp =
    new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/T/g, '_')
      .split('.')[0] ?? ''
  return `${prefix ? `${prefix} - ` : ''}${timestamp}.${extension}`
}

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
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

    // TODO: Add data preview
    case 'data-file':
      return getRoutePath('home')

    default:
      return exhaustive(type)
  }
}
