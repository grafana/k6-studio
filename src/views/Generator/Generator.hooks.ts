import { Params, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function useGeneratorParams() {
  const { path, ...rest } = useParams()

  invariant(path, 'path is required')

  const ruleId = extractRuleId(rest)

  return {
    path,
    ruleId,
  }
}

function extractRuleId(rest: Params<string>) {
  if ('ruleId' in rest) {
    return rest['ruleId']
  }

  if ('*' in rest) {
    return rest['*']?.split('/')[1]
  }

  return undefined
}
