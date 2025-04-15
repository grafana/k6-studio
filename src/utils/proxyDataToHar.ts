import type { Entry, Page } from 'har-format'

import { BrowserEvent } from '@/schemas/recording'
import { GroupedProxyData, ProxyData, Request, Response } from '@/types'
import { EntryWithOptionalResponse, HarWithOptionalResponse } from '@/types/har'

import { groupProxyData } from './groups'
import { getContentTypeWithCharsetHeader } from './headers'

export function proxyDataToHar(
  data: ProxyData[],
  browserEvents: BrowserEvent[]
): HarWithOptionalResponse {
  const groups = groupProxyData(data)
  return {
    log: createLog(createPages(groups), createEntries(groups), browserEvents),
  }
}

function createLog(
  pages: Page[],
  entries: EntryWithOptionalResponse[],
  browserEvents: BrowserEvent[]
): HarWithOptionalResponse['log'] {
  return {
    version: '1.2',
    creator: {
      name: 'k6-studio',
      version: __APP_VERSION__,
    },
    pages,
    entries,
    _browserEvents: browserEvents,
  }
}

function createPages(groups: GroupedProxyData): Page[] {
  return Object.entries(groups).map(([group, data]) => ({
    id: group,
    title: group,
    startedDateTime: timeStampToISO(data[0]?.request.timestampStart),
    pageTimings: {},
  }))
}

function createEntries(groups: GroupedProxyData): EntryWithOptionalResponse[] {
  return Object.entries(groups).flatMap(([group, data]) =>
    data.map((proxyData) => ({
      startedDateTime: timeStampToISO(proxyData.request.timestampStart),
      request: createRequest(proxyData.request),
      response: proxyData.response && createResponse(proxyData.response),
      pageref: group,
      cache: {},
      // TODO: add actual values
      timings: {
        wait: 0,
        receive: 0,
      },
      time: 0,
    }))
  )
}

function createRequest(request: Request): Entry['request'] {
  return {
    method: request.method,
    url: request.url,
    httpVersion: request.httpVersion,
    headers: request.headers.map(([name, value]) => ({ name, value })),
    queryString: request.query.map(([name, value]) => ({ name, value })),
    postData: createPostData(request),
    cookies: request.cookies.map(([name, value]) => ({ name, value })),
    // TODO: add actual values
    headersSize: -1,
    bodySize: -1,
  }
}

function createResponse(response: Response): Entry['response'] {
  return {
    status: response.statusCode,
    statusText: response.reason,
    httpVersion: response.httpVersion,
    headers: response.headers.map(([name, value]) => ({ name, value })),
    content: {
      size: response.contentLength,
      mimeType: getContentTypeWithCharsetHeader(response.headers) ?? '',
      text: response.content,
      encoding: 'base64',
    },
    cookies: response.cookies.map(([name, value]) => ({ name, value })),
    redirectURL: '',
    // TODO: add actual values
    headersSize: -1,
    bodySize: -1,
  }
}

function createPostData(request: Request): Entry['request']['postData'] {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return
  }
  const contentTypeHeader =
    getContentTypeWithCharsetHeader(request.headers) ?? ''
  const content = atob(request.content ?? '')

  // Extract params for urlencoded form
  if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(content)
    const paramsArray = Object.entries(
      Object.fromEntries(params.entries())
    ).map(([key, value]) => ({ name: key, value }))

    return {
      mimeType: contentTypeHeader,
      params: paramsArray,
    }
  }

  return {
    mimeType: getContentTypeWithCharsetHeader(request.headers) ?? '',
    text: atob(request.content ?? ''),
  }
}

function timeStampToISO(timeStamp: number | undefined): string {
  if (!timeStamp) {
    return ''
  }
  return new Date(timeStamp * 1000).toISOString()
}
