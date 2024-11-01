import { getRoutePath } from '../routeMap'
import { StudioFile, StudioFileType } from '@/types'
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

export function isRecording(fileName: string) {
  return fileName.endsWith('.har')
}

export function isGenerator(fileName: string) {
  return fileName.endsWith('.json')
}

export function isScript(fileName: string) {
  return fileName.endsWith('.js')
}

function inferTypeFromFileName(fileName: string): StudioFileType {
  if (isRecording(fileName)) {
    return 'recording'
  }

  if (isGenerator(fileName)) {
    return 'generator'
  }

  if (isScript(fileName)) {
    return 'script'
  }

  throw new Error('Unknown file type.')
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

    default:
      return exhaustive(type)
  }
}

export function fileFromFileName(fileName: string): StudioFile {
  const type = inferTypeFromFileName(fileName)

  return {
    type,
    displayName: getFileNameWithoutExtension(fileName),
    fileName: fileName,
    viewPath: getViewPath(type, fileName),
  }
}
