import * as path from 'pathe'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { StudioFile, StudioFileType } from '@/types'

export function useActiveFileName() {
  const { fileName } = useParams<{ fileName: string }>()

  return fileName
}

export function useCurrentFile(type: StudioFileType): StudioFile {
  const file = useActiveFileName()

  invariant(file, 'fileName param is required')

  return {
    type,
    displayName: path.basename(file, path.extname(file)),
    fileName: file,
  }
}
