import * as pathe from 'pathe'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { StudioFile, SupportedFileType } from '@/types'

export function useCurrentFile(type: SupportedFileType): StudioFile {
  const { path: pathParam } = useParams()

  invariant(pathParam, 'path is required')

  const path = decodeURIComponent(pathParam)
  const fileName = pathe.basename(path)
  const displayName = pathe.basename(path, pathe.extname(path))

  return {
    type,
    path,
    fileName,
    displayName,
  }
}

export function useCurrentPath(): string | undefined {
  const { path } = useParams<{ path: string }>()

  return path
}
