import { Header, Request } from '@/types'
import { RegexSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

export function replaceRegex(
  selector: RegexSelector,
  request: Request,
  newValue: string
): Request {
  switch (selector.from) {
    case 'body':
      return replaceRegexBody(selector, request, newValue)
    case 'headers':
      return replaceRegexHeaders(selector, request, newValue)
    case 'url':
      return replaceRegexUrl(selector, request, newValue)
    default:
      return exhaustive(selector.from)
  }
}

export function matchRegex(value: string, regexString: string) {
  if (regexString === '') return undefined

  // Match only the first occurrence
  const regex = new RegExp(regexString)
  const match = value.match(regex)

  if (match) {
    // Return the capture group if it exists (even if empty), otherwise return the full match
    return match[1] !== undefined ? match[1] : match[0]
  }
}

function replaceRegexBody(
  selector: RegexSelector,
  request: Request,
  newValue: string
): Request {
  const match = matchRegex(request.content ?? '', selector.regex)
  if (match === undefined) return request

  const content = replaceRegexPattern(
    request.content ?? '',
    selector.regex,
    newValue
  )
  return { ...request, content }
}

function replaceRegexHeaders(
  selector: RegexSelector,
  request: Request,
  newValue: string
): Request {
  for (const [key, value] of request.headers) {
    const match = matchRegex(value, selector.regex)
    if (match === undefined) continue

    const replacedValue = replaceRegexPattern(value, selector.regex, newValue)

    const headers: Header[] = request.headers.map(([k, v]) =>
      k === key && v === value ? [k, replacedValue] : [k, v]
    )

    return { ...request, headers }
  }

  return request
}

function replaceRegexUrl(
  selector: RegexSelector,
  request: Request,
  newValue: string
): Request {
  const match = matchRegex(request.url, selector.regex)
  if (match === undefined) return request

  const url = replaceRegexPattern(request.url, selector.regex, newValue)
  const path = replaceRegexPattern(request.path, selector.regex, newValue)
  const host = replaceRegexPattern(request.host, selector.regex, newValue)
  return { ...request, url, path, host }
}

function replaceRegexPattern(
  content: string,
  regexString: string,
  newValue: string
) {
  // Getting match indices requires the 'd' flag
  const regex = new RegExp(regexString, 'd')
  const match = regex.exec(content)

  if (!match) {
    return content
  }

  // If there's a capture group, replace only that group using its position
  if (match[1] !== undefined && match.indices?.[1]) {
    const [groupStart, groupEnd] = match.indices[1]
    return (
      content.substring(0, groupStart) + newValue + content.substring(groupEnd)
    )
  }

  // If no capture group, replace the entire match
  const matchStart = match.index
  const matchEnd = matchStart + match[0].length
  // const [matchStart, matchEnd] = match.indices[0]
  return (
    content.substring(0, matchStart) + newValue + content.substring(matchEnd)
  )
}
