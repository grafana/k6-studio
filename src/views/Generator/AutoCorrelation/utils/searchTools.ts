import Fuse from 'fuse.js'

import { ProxyData, Request, Response } from '@/types'
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

export function searchRequests(
  requests: ProxyData[],
  query: string,
  limit: number = 20
) {
  const filteredRequests = requests.filter(isNonStaticAssetResponse)

  const fuse = new Fuse(filteredRequests, {
    keys: [
      'request.url',
      'request.method',
      'request.host',
      'response.statusCode',
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
