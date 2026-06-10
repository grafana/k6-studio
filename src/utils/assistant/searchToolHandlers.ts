import Fuse from 'fuse.js'

import { Header, ProxyData, Request, Response } from '@/types'
import { safeAtob } from '@/utils/format'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import { prepareRequestsForAI } from './stripRequestData'

interface FilteredRequest {
  method: Request['method']
  url: Request['url']
  headers?: Request['headers']
  content?: Request['content']
  cookies?: Request['cookies']
}

interface FilteredResponse {
  statusCode: Response['statusCode']
  headers?: Response['headers']
  content?: Response['content']
  cookies?: Response['cookies']
}

interface FilteredProxyData {
  request: FilteredRequest
  response?: FilteredResponse
}

export function getRequestsMetadata(
  requests: ProxyData[],
  startIndex: number = 0,
  endIndex?: number
) {
  const slice = endIndex
    ? requests.slice(startIndex, endIndex)
    : requests.slice(startIndex)

  return slice
    .filter((data) => isNonStaticAssetResponse(data))
    .map((data) => ({
      id: data.id,
      method: data.request.method,
      url: data.request.url,
      statusCode: data.response?.statusCode,
      hasRequestBody: !!data.request.content,
      hasResponseBody: !!data.response?.content,
    }))
}

const flattenHeaders = (headers: Header[] | undefined) =>
  (headers ?? []).map(([key, value]) => `${key}: ${value}`)

const decodeContent = (content: string | null | undefined) =>
  safeAtob(content ?? '')

export function searchRequests(
  requests: ProxyData[],
  query: string,
  limit: number = 20
) {
  const filteredRequests = requests.filter(isNonStaticAssetResponse)

  const fuse = new Fuse(filteredRequests, {
    // Fuse defaults (location: 0, distance: 100) only match near the start of a
    // field, so a token deep in a header or body is never found. ignoreLocation
    // matches anywhere in any field (this also broadens url/host matching).
    ignoreLocation: true,
    keys: [
      'request.url',
      'request.method',
      'request.host',
      'response.statusCode',
      {
        name: 'requestHeaders',
        getFn: (data) => flattenHeaders(data.request.headers),
      },
      {
        name: 'responseHeaders',
        getFn: (data) => flattenHeaders(data.response?.headers),
      },
      {
        name: 'requestBody',
        getFn: (data) => decodeContent(data.request.content),
      },
      {
        name: 'responseBody',
        getFn: (data) => decodeContent(data.response?.content),
      },
    ],
  })

  const results = fuse.search(query).slice(0, limit)

  return results.map((result) => ({
    id: result.item.id,
    method: result.item.request.method,
    url: result.item.request.url,
    statusCode: result.item.response?.statusCode,
  }))
}

export function getRequestDetails(
  requests: ProxyData[],
  requestIds: string[],
  fields?: Array<
    | 'headers'
    | 'body'
    | 'cookies'
    | 'responseHeaders'
    | 'responseBody'
    | 'responseCookies'
  >
) {
  const requestsById = new Map(requests.map((r) => [r.id, r]))

  const selectedRequests = requestIds
    .map((id) => requestsById.get(id))
    .filter((r): r is ProxyData => r !== undefined)

  if (!fields || fields.length === 0) {
    return prepareRequestsForAI(selectedRequests)
  }

  return prepareRequestsForAI(selectedRequests).map(
    (req): FilteredProxyData => {
      const filteredRequest: FilteredRequest = {
        method: req.request.method,
        url: req.request.url,
        ...(fields.includes('headers') && { headers: req.request.headers }),
        ...(fields.includes('body') && { content: req.request.content }),
        ...(fields.includes('cookies') && { cookies: req.request.cookies }),
      }

      const responseFields = fields.filter((f) => f.startsWith('response'))
      if (responseFields.length === 0 || !req.response) {
        return { request: filteredRequest }
      }

      const filteredResponse: FilteredResponse = {
        statusCode: req.response.statusCode,
        ...(fields.includes('responseHeaders') && {
          headers: req.response.headers,
        }),
        ...(fields.includes('responseBody') && {
          content: req.response.content,
        }),
        ...(fields.includes('responseCookies') && {
          cookies: req.response.cookies,
        }),
      }

      return { request: filteredRequest, response: filteredResponse }
    }
  )
}
