import { CorrelationRule } from '@/types/rules'
import { Request } from '@/types'
import { replaceRequestValues, replaceTextMatches } from './shared'

export function replaceCorrelatedValues({
  rule,
  extractedValue,
  uniqueId,
  request,
}: {
  rule: CorrelationRule
  extractedValue: string
  uniqueId: number
  request: Request
}) {
  const varName = `\${correlation_vars['correlation_${uniqueId}']}`
  // Default behaviour replaces all occurences of the string
  if (!rule.replacer) {
    return replaceTextMatches(request, extractedValue, varName)
  }

  return replaceRequestValues({
    selector: rule.replacer.selector,
    request,
    value: varName,
  })
}
