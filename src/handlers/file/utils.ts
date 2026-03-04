import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { getFilePath } from '@/main/file'
import { exhaustive } from '@/utils/typescript'

import { FileContentType, FileLocation } from './types'

export function resolveFileLocation(
  fileType: FileContentType,
  location: FileLocation
): string {
  switch (location.type) {
    case 'path':
      return location.path

    case 'legacy': {
      invariant(
        !INVALID_FILENAME_CHARS.test(location.name),
        'Invalid file name'
      )
      return getFilePath({
        type: fileType,
        fileName: location.name,
      })
    }

    case 'new':
      throw new Error('Files with location "new" are not supported')

    default:
      return exhaustive(location)
  }
}
