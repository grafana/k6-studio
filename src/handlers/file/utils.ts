import { exhaustive } from '@/utils/typescript'

import { FileContentType, FileLocation } from './types'

export function resolveFileLocation(
  fileType: FileContentType,
  location: FileLocation
): string {
  switch (location.type) {
    case 'path':
      return location.path

    case 'new':
      throw new Error('Files with location "new" are not supported')

    default:
      return exhaustive(location)
  }
}
