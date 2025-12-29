import { flow } from 'lodash-es'

import { Request } from '@/types'
import { CorrelationRule } from '@/types/rules'

import {
  replaceAllBody,
  replaceAllCookies,
  replaceAllHeader,
  replaceAllUrl,
  replaceRequestValues,
} from './shared'

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
  // Default behavior replaces all occurrences of the string
  if (!rule.replacer?.selector) {
    return replaceAllTextMatches(request, extractedValue, varName)
  }

  return replaceRequestValues({
    selector: rule.replacer.selector,
    request,
    value: varName,
  })
}

const replaceAllTextMatches = (
  request: Request,
  oldValue: string,
  newValue: string
) => {
  const replaceAll: (
    request: Request,
    oldValue: string,
    newValue: string
  ) => Request = flow([
    (request: Request) => replaceAllBody(request, oldValue, newValue),
    (request: Request) => replaceAllUrl(request, oldValue, newValue),
    (request: Request) => replaceAllCookies(request, oldValue, newValue),
    (request: Request) => replaceAllHeader(request, oldValue, newValue),
  ])

  return replaceAll(request, oldValue, newValue)
}
