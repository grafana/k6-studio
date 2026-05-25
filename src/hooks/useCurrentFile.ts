import { useParams } from 'react-router-dom'

import { StudioFile, StudioFileType } from '@/types'
import { invariant } from '@/utils/invariant'
import * as path from '@/utils/path'

export function useActiveFilePath() {
  const { filePath } = useParams<{ filePath: string }>()

  return filePath
}

export function useCurrentFile(type: StudioFileType): StudioFile {
  const filePath = useActiveFilePath()

  invariant(filePath, 'filePath param is required')

  const { base, name } = path.parse(filePath)

  return {
    type,
    path: filePath,
    fileName: base,
    displayName: name,
  }
}
