import { DEFAULT_GROUP_NAME } from '@/constants'
import { Method, ProxyData, Request, Response } from '@/types'
import { EntryWithOptionalResponse, HarWithOptionalResponse } from '@/types/har'
import type { Content } from 'har-format'

export function harToProxyData(har: HarWithOptionalResponse): ProxyData[] {
  return har.log.entries.map((entry) => ({
    id: self.crypto.randomUUID(),
    request: parseRequest(entry),
    response: parseResponse(entry),
    group: entry.pageref || DEFAULT_GROUP_NAME,
  }))
}

function sumTimings(timings: Array<number | undefined>, offset = 0): number {
  return timings.reduce<number>((acc, t) => {
    if (t === undefined || t === -1) {
      return acc
    }

    return acc + t
  }, offset)
}

function parseRequest({
  startedDateTime,
  timings,
  request,
}: EntryWithOptionalResponse): Request {
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

  const timestampStart = startedDateTime
    ? isoToUnixTimestamp(startedDateTime)
    : 0

  const timestampEnd = sumTimings(
    [timings.blocked, timings.dns, timings.connect, timings.send],
    timestampStart
  )

  return {
    method: request.method as Method,
    url: request.url,
    httpVersion: request.httpVersion,
    headers: request.headers.map((h) => [h.name, h.value]),
    query: request.queryString.map((q) => [q.name, q.value]),
    cookies: request.cookies.map((c) => [c.name, c.value]),
    content,
    timestampStart,
    timestampEnd,
    scheme: url.protocol.replace(':', ''),
    host: url.hostname,
    path: url.pathname + url.search,
    contentLength: content.length,
  }
}

function parseResponse({
  startedDateTime,
  timings,
  response,
}: EntryWithOptionalResponse): Response | undefined {
  if (response === undefined) {
    return undefined
  }

  const startedTimestamp = startedDateTime
    ? isoToUnixTimestamp(startedDateTime)
    : 0

  const timestampStart = sumTimings(
    [timings.blocked, timings.dns, timings.connect, timings.send],
    startedTimestamp
  )

  return {
    statusCode: response.status,
    reason: response.statusText,
    httpVersion: response.httpVersion,
    headers: response.headers.map((h) => [h.name, h.value]),
    cookies: response.cookies.map((c) => [c.name, c.value]),
    content: parseContent(response.content),
    contentLength: response.content?.size ?? 0,
    timestampStart,
    timestampEnd: timestampStart + sumTimings([timings.wait, timings.receive]),
    path: '',
  }
}

function isoToUnixTimestamp(isoString: string): number {
  return new Date(isoString).getTime() / 1000
}

function parseContent(content: Content): string {
  if (!content.text) return ''

  if (content.encoding === 'base64') {
    return atob(content.text)
  }
  return content.text
}
