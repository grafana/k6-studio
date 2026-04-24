import { parse } from 'pathe'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { StudioFile, StudioFileType } from '@/types'

export function useActiveFilePath() {
  const { filePath } = useParams<{ filePath: string }>()

  return filePath
}

export function useCurrentFile(type: StudioFileType): StudioFile {
  const filePath = useActiveFilePath()

  invariant(filePath, 'filePath param is required')

  const { base, name } = parse(filePath)

  return {
    type,
    path: filePath,
    fileName: base,
    displayName: name,
  }
}
