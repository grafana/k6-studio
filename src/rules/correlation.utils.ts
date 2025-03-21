import { Cookie, Header, Request } from '@/types'
import { CorrelationRule } from '@/types/rules'

import {
  replaceContent,
  replaceCookies,
  replaceHeaders,
  replaceRequestValues,
  replaceUrl,
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
  // Default behaviour replaces all occurences of the string
  if (!rule.replacer?.selector) {
    return replaceAllTextMatches(request, extractedValue, varName)
  }

  return replaceRequestValues({
    selector: rule.replacer.selector,
    request,
    value: varName,
  })
}

function replaceAllTextMatches(
  request: Request,
  extractedValue: string,
  variableName: string
): Request {
  const content = replaceContent(request.content, extractedValue, variableName)
  const url = replaceUrl(request.url, extractedValue, variableName)
  const path = replaceUrl(request.path, extractedValue, variableName)
  const host = replaceUrl(request.host, extractedValue, variableName)
  const headers: Header[] = replaceHeaders(
    request.headers,
    extractedValue,
    variableName
  )
  const cookies: Cookie[] = replaceCookies(
    request.cookies,
    extractedValue,
    variableName
  )

  return {
    ...request,
    content,
    url,
    path,
    host,
    headers,
    cookies,
  }
}
