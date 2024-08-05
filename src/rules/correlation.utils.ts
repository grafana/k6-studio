import { BeginEndSelector, CorrelationRule, RegexSelector } from '@/types/rules'
import { Header, Request, Cookie } from '@/types'
import {exhaustive} from '@/utils/typescript'
import { replaceContent, replaceBeginEndBody, replaceBeginEndHeaders, replaceUrl, replaceHeaders, replaceBeginEndUrl, replaceCookies, replaceRegexBody, replaceRegexHeaders, replaceRegexUrl } from './shared'

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
  // Default behaviour replaces all occurences of the string
  if (!rule.replacer) {
    return replaceTextMatches(request, extractedValue, `correl_${uniqueId}`)
  }

  switch (rule.replacer.selector.type) {
    case 'begin-end':
      return replaceBeginEnd(rule.replacer.selector as BeginEndSelector, request, `correl_${uniqueId}`)
    case 'regex':
      return replaceRegex(rule.replacer.selector as RegexSelector, request, `correl_${uniqueId}`)
    default:
      return exhaustive(rule.replacer.selector.type)
  }
}

const replaceBeginEnd = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
) => {
  switch (selector.from) {
    case 'body':
      return replaceBeginEndBody(selector, request, variableName)
    case 'headers':
      return replaceBeginEndHeaders(selector, request, variableName)
    case 'url':
      return replaceBeginEndUrl(selector, request, variableName)
    default:
      return exhaustive(selector.from)
  }
}

const replaceRegex = (
  selector: RegexSelector,
  request: Request,
  variableName: string
) => {
  switch (selector.from) {
    case 'body':
      return replaceRegexBody(selector, request, variableName)
    case 'headers':
      return replaceRegexHeaders(selector, request, variableName)
    case 'url':
      return replaceRegexUrl(selector, request, variableName)
    default:
      return exhaustive(selector.from)
  }
}

export function replaceTextMatches(
  request: Request,
  extractedValue: string,
  variableName: string
): Request {
  const content = replaceContent(request, extractedValue, variableName)
  const url = replaceUrl(request, extractedValue, variableName)
  const path = request.path.replaceAll(extractedValue, `\${${variableName}}`)
  const headers: Header[] = replaceHeaders(request, extractedValue, variableName)
  const cookies: Cookie[] = replaceCookies(request, extractedValue, variableName)

  return {
    ...request,
    content,
    url,
    path,
    headers,
    cookies,
  }
}
