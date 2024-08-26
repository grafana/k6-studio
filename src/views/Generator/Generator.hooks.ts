import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function useGeneratorParams() {
  const { fileName, ruleId } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
    ruleId,
  }
}
