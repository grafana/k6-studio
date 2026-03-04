import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { StudioFile, StudioFileType } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

export function useFileNameParam(type: StudioFileType): StudioFile {
  const { fileName } = useParams()

  invariant(fileName, 'fileName is required')

  return {
    type,
    fileName,
    displayName: getFileNameWithoutExtension(fileName),
  }
}
