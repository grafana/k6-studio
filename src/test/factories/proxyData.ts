import { ProxyData } from '@/types'

export function createRequest(
  request?: Partial<ProxyData['request']>
): ProxyData['request'] {
  return {
    headers: [],
    cookies: [],
    query: [],
    scheme: 'http',
    host: 'example.com',
    method: 'GET',
    path: '/api/v1/users',
    content: null,
    timestampStart: 0,
    timestampEnd: 0,
    contentLength: 0,
    httpVersion: '1.1',
    url: 'http://example.com',
    ...request,
  }
}

export function createResponse(
  response?: Partial<ProxyData['response']>
): ProxyData['response'] {
  return {
    statusCode: 200,
    headers: [['content-type', 'application/json']],
    cookies: [],
    reason: 'OK',
    content: '{"hello":"world"}',
    path: '/api/v1/users',
    httpVersion: '1.1',
    timestampStart: 0,
    contentLength: 0,
    ...response,
  }
}
export function createProxyData(proxyData?: Partial<ProxyData>): ProxyData {
  return {
    id: '1',
    request: createRequest(),
    response: createResponse(),
    ...proxyData,
  }
}

export function createProxyDataWithoutResponse(
  proxyData?: Partial<ProxyData>
): ProxyData {
  return {
    id: '1',
    request: createRequest(),
    ...proxyData,
  }
}
