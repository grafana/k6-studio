import { Method, ProxyData, Request, Response } from '@/types'
import { HarWithOptionalResponse } from '@/types/har'
import type { Entry } from 'har-format'

export function harToProxyData(har: HarWithOptionalResponse): ProxyData[] {
  return har.log.entries.map((entry) => ({
    id: self.crypto.randomUUID(),
    request: parseRequest(entry.request),
    response: entry.response ? parseResponse(entry.response) : undefined,
    group: entry.pageref || 'default',
  }))
}

function parseRequest(request: Entry['request']): Request {
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

  const url = new URL(request.url)

  return {
    method: request.method as Method,
    url: request.url,
    httpVersion: request.httpVersion,
    headers: request.headers.map((h) => [h.name, h.value]),
    query: request.queryString.map((q) => [q.name, q.value]),
    cookies: request.cookies.map((c) => [c.name, c.value]),
    content,
    // TODO: add actual values
    // @ts-expect-error incomplete type
    timestampStart: request.startedDateTime
      ? // @ts-expect-error incomplete type
        isoToUnixTimestamp(request.startedDateTime)
      : 0,
    timestampEnd: 0,
    scheme: url.protocol.replace(':', ''),
    host: url.hostname,
    path: url.pathname,
    contentLength: content.length,
  }
}

function parseResponse(response: Entry['response']): Response {
  const content = response.content?.text ? atob(response.content.text) : ''
  return {
    statusCode: response.status,
    reason: response.statusText,
    httpVersion: response.httpVersion,
    headers: response.headers.map((h) => [h.name, h.value]),
    cookies: response.cookies.map((c) => [c.name, c.value]),
    content,
    contentLength: response.content?.size ?? 0,
    timestampStart: 0,
    path: '',
  }
}

function isoToUnixTimestamp(isoString: string): number {
  return new Date(isoString).getTime() / 1000
}
