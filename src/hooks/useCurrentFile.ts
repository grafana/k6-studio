import { useParams } from 'react-router-dom'

export function useActiveFilePath() {
  const { filePath } = useParams<{ filePath: string }>()

  return filePath
}
