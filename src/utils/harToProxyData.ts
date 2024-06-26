import { GroupedProxyData, Method, Request, Response } from '@/types'
import { HarWithOptionalResponse } from '@/types/har'
import type { Entry } from 'har-format'

export function harToGroupedProxyData(
  har: HarWithOptionalResponse
): GroupedProxyData {
  return har.log.entries.reduce<GroupedProxyData>((acc, entry) => {
    const proxyData = {
      id: self.crypto.randomUUID(),
      request: parseRequest(entry.request),
      response: entry.response ? parseResponse(entry.response) : undefined,
    }

    const group = entry.pageref || 'default'

    if (!acc[group]) {
      return {
        ...acc,
        [group]: [proxyData],
      }
    }

    return {
      ...acc,
      // @ts-expect-error acc[group] is always defined
      [group]: [...acc[group], proxyData],
    }
  }, {})
}

function parseRequest(request: Entry['request']): Request {
  const content = request.postData?.text ? btoa(request.postData.text) : ''
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
    // TODO: check if this needs a value
    scheme: '',
    host: url.hostname,
    path: url.pathname,
    contentLength: content.length,
  }
}

function parseResponse(response: Entry['response']): Response {
  return {
    statusCode: response.status,
    reason: response.statusText,
    httpVersion: response.httpVersion,
    headers: response.headers.map((h) => [h.name, h.value]),
    cookies: response.cookies.map((c) => [c.name, c.value]),
    content: response.content?.text ? btoa(response.content.text) : '',
    contentLength: response.content?.size ?? 0,
    timestampStart: 0,
    path: '',
  }
}

function isoToUnixTimestamp(isoString: string): number {
  return new Date(isoString).getTime() / 1000
}
