import { escapeRegExp } from 'lodash-es'

import { Header, Request } from '@/types'
import { BeginEndSelector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

export function replaceBeginEnd(
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request {
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

export function matchBeginEnd(value: string, begin: string, end: string) {
  if (begin === '' || end === '') return undefined

  // Match only the first occurrence
  const regex = new RegExp(`${escapeRegExp(begin)}(.*?)${escapeRegExp(end)}`)
  const match = value.match(regex)

  if (match) {
    return match[1]
  }
}

function replaceBeginEndPattern(
  content: string,
  begin: string,
  end: string,
  newValue: string
) {
  const regex = new RegExp(`${escapeRegExp(begin)}(.*?)${escapeRegExp(end)}`)
  return content.replace(regex, `${begin}${newValue}${end}`)
}

function replaceBeginEndBody(
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request {
  const match = matchBeginEnd(
    request.content ?? '',
    selector.begin,
    selector.end
  )
  if (match === undefined) return request

  const content = replaceBeginEndPattern(
    request.content ?? '',
    selector.begin,
    selector.end,
    variableName
  )
  return { ...request, content }
}

function replaceBeginEndHeaders(
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request {
  for (const [key, value] of request.headers) {
    const match = matchBeginEnd(value, selector.begin, selector.end)

    if (match === undefined) continue

    const replacedValue = replaceBeginEndPattern(
      value,
      selector.begin,
      selector.end,
      variableName
    )

    const headers: Header[] = request.headers.map(([k, v]) =>
      k === key && v === value ? [k, replacedValue] : [k, v]
    )

    return { ...request, headers }
  }

  return request
}

function replaceBeginEndUrl(
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request {
  const match = matchBeginEnd(request.url, selector.begin, selector.end)
  if (match === undefined) return request

  const url = replaceBeginEndPattern(
    request.url,
    selector.begin,
    selector.end,
    variableName
  )
  const path = replaceBeginEndPattern(
    request.path,
    selector.begin,
    selector.end,
    variableName
  )
  const host = replaceBeginEndPattern(
    request.host,
    selector.begin,
    selector.end,
    variableName
  )
  return { ...request, url, path, host }
}
