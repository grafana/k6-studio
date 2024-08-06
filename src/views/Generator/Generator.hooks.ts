import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function useGeneratorParams() {
  const { path, ruleId } = useParams()
  invariant(path, 'path is required')

  return {
    path,
    ruleId,
  }
}
