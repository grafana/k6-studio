import { DEFAULT_GROUP_NAME } from '@/constants'
import { Recording } from '@/schemas/recording'
import { useFeaturesStore } from '@/store/features'
import {
  generateJsonPaths,
  isJsonContentType,
} from '@/store/generator/slices/recording.utils'
import { Method, ProxyData, Request, Response } from '@/types'
import type { HarContent, HarEntry, HarHeader } from '@/types/recording'

import { safeAtob } from './format'

export function harToProxyData(har: Recording): ProxyData[] {
  return (har.log.entries ?? []).map((entry) => {
    const request = harEntryToRequest(entry)
    const response = harEntryToResponse(entry)

    return {
      id: self.crypto.randomUUID(),
      request,
      response,
      group: entry.pageref || DEFAULT_GROUP_NAME,
    }
  })
}

function harEntryToRequest({ request, startedDateTime }: HarEntry): Request {
  let content = request.postData?.text ?? ''
  const postDataParams = request.postData?.params

  if (postDataParams && postDataParams.length > 0) {
    content = JSON.stringify(
      postDataParams.reduce(
        (acc, param) => {
          acc[param.name] = param.value
          return acc
        },
        {} as Record<string, string | undefined>
      )
    )
  }

  const jsonPaths = parseJsonPaths(content, request.headers ?? [])
  const url = new URL(request.url)

  return {
    method: request.method as Method,
    url: request.url,
    httpVersion: request.httpVersion ?? 'HTTP/1.1',
    headers: (request.headers ?? []).map((h) => [h.name, h.value]),
    query: (request.queryString ?? []).map((q) => [q.name, q.value]),
    cookies: (request.cookies ?? []).map((c) => [c.name, c.value]),
    jsonPaths,
    content,
    timestampStart: startedDateTime ? isoToUnixTimestamp(startedDateTime) : 0,
    timestampEnd: 0,
    scheme: url.protocol.replace(':', ''),
    host: url.hostname,
    path: url.pathname + url.search,
    contentLength: content.length,
  }
}

function harEntryToResponse({ response }: HarEntry): Response | undefined {
  if (!response) {
    return undefined
  }

  const content = parseContent(response.content)
  const jsonPaths = parseJsonPaths(content, response.headers)

  return {
    statusCode: response.status,
    reason: response.statusText,
    httpVersion: response.httpVersion,
    headers: response.headers.map((h) => [h.name, h.value]),
    cookies: response.cookies.map((c) => [c.name, c.value]),
    jsonPaths,
    content,
    contentLength: response.content?.size ?? 0,
    timestampStart: 0,
    path: '',
  }
}

function parseJsonPaths(content: string, headers: HarHeader[]): string[] {
  const isJsonPathsFeatureFlagTrue =
    useFeaturesStore.getState().features['typeahead-json']
  const isJsonPathsEnabled =
    isJsonPathsFeatureFlagTrue && isJsonContentType(headers)

  if (!isJsonPathsEnabled) {
    return []
  }
  return generateJsonPaths(content)
}

function isoToUnixTimestamp(isoString: string): number {
  return new Date(isoString).getTime() / 1000
}

function parseContent(content: HarContent): string {
  if (!content.text) return ''

  if (content.encoding === 'base64') {
    return safeAtob(content.text)
  }
  return content.text
}
