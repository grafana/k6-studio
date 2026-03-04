import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function useFileNameParam(): { fileName: string } {
  const { fileName } = useParams()

  invariant(fileName, 'fileName is required')

  return { fileName }
}
