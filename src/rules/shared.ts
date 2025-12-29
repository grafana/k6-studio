import { escapeRegExp, get, set } from 'lodash-es'

import { Header, Request } from '@/types'
import {
  BeginEndSelector,
  HeaderNameSelector,
  JsonSelector,
  RegexSelector,
  ReplacerSelector,
} from '@/types/rules'
import { safeJsonParse } from '@/utils/json'
import { exhaustive } from '@/utils/typescript'

import { replaceText } from './selectors/text'
import { canonicalHeaderKey, isJsonReqResp } from './utils'

export function replaceRequestValues({
  selector,
  value,
  request,
}: {
  selector: ReplacerSelector
  request: Request
  value: string
}): Request | undefined {
  switch (selector.type) {
    case 'begin-end':
      return replaceBeginEnd(selector, request, value)
    case 'regex':
      return replaceRegex(selector, request, value)
    case 'json':
      return replaceJsonBody(selector, request, value)
    case 'header-name':
      return replaceHeaderByName(request, selector, value)
    case 'text':
      return replaceText(request, selector, value)
    default:
      return exhaustive(selector)
  }
}

const replaceBeginEnd = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request | undefined => {
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
): Request | undefined => {
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

export const matchBeginEnd = (value: string, begin: string, end: string) => {
  // matches only the first occurrence
  const regex = new RegExp(`${escapeRegExp(begin)}(.*?)${escapeRegExp(end)}`)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const matchRegex = (value: string, regexString: string) => {
  // matches only the first occurrence
  const regex = new RegExp(regexString)
  const match = value.match(regex)
  if (match) {
    return match[1]
  }
}

export const getJsonObjectFromPath = (json: string, path: string) => {
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return get(safeJsonParse(json), path)
}

const setJsonObjectFromPath = (json: string, path: string, value: string) => {
  const jsonObject = safeJsonParse(json)
  set(jsonObject ?? {}, path, value)
  return JSON.stringify(jsonObject)
}

export const replaceBeginEndPattern = (
  content: string,
  begin: string,
  end: string,
  newValue: string
) => {
  const regex = new RegExp(`${escapeRegExp(begin)}(.*?)${escapeRegExp(end)}`)
  return content.replace(regex, `${begin}${newValue}${end}`)
}

export const replaceRegexPattern = (
  content: string,
  regexString: string,
  newValue: string
) => {
  const regex = new RegExp(regexString)
  return content.replace(regex, (fullMatch, ...groups) => {
    // If there's a capture group, replace only that group
    if (groups[0] !== undefined) {
      return fullMatch.replace(groups[0] as string, newValue)
    }
    // If no capture group, replace the entire match
    return newValue
  })
}

const replaceBeginEndBody = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  const valueToReplace = matchBeginEnd(
    request.content ?? '',
    selector.begin,
    selector.end
  )
  if (!valueToReplace) return

  const content = replaceBeginEndPattern(
    request.content ?? '',
    selector.begin,
    selector.end,
    variableName
  )
  return { ...request, content }
}

const replaceBeginEndHeaders = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  for (const [key, value] of request.headers) {
    const valueToReplace = matchBeginEnd(value, selector.begin, selector.end)
    if (valueToReplace) {
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
  }

  return
}

const replaceBeginEndUrl = (
  selector: BeginEndSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  const valueToReplace = matchBeginEnd(
    request.url,
    selector.begin,
    selector.end
  )
  if (!valueToReplace) return

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

const replaceRegexBody = (
  selector: RegexSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  const valueToReplace = matchRegex(request.content ?? '', selector.regex)
  if (!valueToReplace) return

  const content = replaceRegexPattern(
    request.content ?? '',
    selector.regex,
    variableName
  )
  return { ...request, content }
}

const replaceRegexHeaders = (
  selector: RegexSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  for (const [key, value] of request.headers) {
    const valueToReplace = matchRegex(value, selector.regex)
    if (valueToReplace) {
      const replacedValue = replaceRegexPattern(
        value,
        selector.regex,
        variableName
      )

      const headers: Header[] = request.headers.map(([k, v]) =>
        k === key && v === value ? [k, replacedValue] : [k, v]
      )

      return { ...request, headers }
    }
  }

  return
}

const replaceRegexUrl = (
  selector: RegexSelector,
  request: Request,
  variableName: string
): Request | undefined => {
  const valueToReplace = matchRegex(request.url, selector.regex)
  if (!valueToReplace) return

  const url = replaceRegexPattern(request.url, selector.regex, variableName)
  const path = replaceRegexPattern(request.path, selector.regex, variableName)
  const host = replaceRegexPattern(request.host, selector.regex, variableName)
  return { ...request, url, path, host }
}

const replaceJsonBody = (
  selector: JsonSelector,
  request: Request,
  value: string
): Request | undefined => {
  if (!isJsonReqResp(request) || !request.content) {
    return
  }

  // since we are using lodash and its `set` function creates missing paths we will first check that the path really
  // exists before setting it
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const valueToReplace = getJsonObjectFromPath(request.content, selector.path)
  if (valueToReplace === undefined) return

  const content = setJsonObjectFromPath(request.content, selector.path, value)
  return { ...request, content }
}

const replaceHeaderByName = (
  request: Request,
  selector: HeaderNameSelector,
  value: string
): Request | undefined => {
  const headerExists = request.headers.find(
    ([key]) => canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
  )

  if (!headerExists) {
    return
  }

  const replacedHeaders = request.headers.map(
    ([key, originalValue]): Header =>
      canonicalHeaderKey(key) === canonicalHeaderKey(selector.name)
        ? [key, value]
        : [key, originalValue]
  )

  return { ...request, headers: replacedHeaders }
}

export function replaceAllBody(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  if (!request?.content?.includes(oldValue)) {
    return request
  }

  return {
    ...request,
    content: request.content.replaceAll(oldValue, newValue),
  }
}

export function replaceAllUrl(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  if (!request.url.includes(oldValue)) {
    return request
  }
  return {
    ...request,
    url: request.url.replaceAll(oldValue, newValue),
    path: request.path.replaceAll(oldValue, newValue),
    host: request.host.replaceAll(oldValue, newValue),
  }
}

export function replaceAllHeader(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  const headerExists = request?.headers.find(([, value]) =>
    value.includes(oldValue)
  )

  if (!headerExists) {
    return request
  }

  return {
    ...request,
    headers: request.headers.map(([key, headerValue]) => {
      const replacedValue = headerValue.replaceAll(oldValue, newValue)
      return [key, replacedValue]
    }),
  }
}

export function replaceAllCookies(
  request: Request,
  oldValue: string,
  newValue: string
): Request {
  const cookieExists = request?.cookies.find(([, value]) =>
    value.includes(oldValue)
  )

  if (!cookieExists) {
    return request
  }

  return {
    ...request,
    cookies: request.cookies.map(([key, cookieValue]) => {
      const replacedValue = cookieValue.replaceAll(oldValue, newValue)
      return [key, replacedValue]
    }),
  }
}
