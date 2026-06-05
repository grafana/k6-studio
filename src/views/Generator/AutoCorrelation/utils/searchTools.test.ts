import { describe, it, expect } from 'vitest'

import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'

import { searchRequests } from './searchTools'

describe('searchRequests', () => {
  it('matches by request header name and value', () => {
    const target = createProxyData({
      id: 'with-header',
      request: createRequest({
        headers: [['x-correlation-id', 'abc-correlation-123']],
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'abc-correlation-123')

    expect(results.map((result) => result.id)).toContain('with-header')
  })

  it('matches by response header value', () => {
    const target = createProxyData({
      id: 'with-response-header',
      response: createResponse({
        headers: [
          ['content-type', 'application/json'],
          ['x-powered-by', 'k6-studio-server'],
        ],
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'k6-studio-server')

    expect(results.map((result) => result.id)).toContain('with-response-header')
  })

  it('matches by request body content', () => {
    const target = createProxyData({
      id: 'with-request-body',
      request: createRequest({
        method: 'POST',
        content: '{"username":"correlationUser"}',
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'correlationUser')

    expect(results.map((result) => result.id)).toContain('with-request-body')
  })

  it('matches by response body content', () => {
    const target = createProxyData({
      id: 'with-response-body',
      response: createResponse({
        content: '{"sessionToken":"responseTokenValue"}',
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'responseTokenValue')

    expect(results.map((result) => result.id)).toContain('with-response-body')
  })

  it('matches a token deep inside a large response body, ignoring its location', () => {
    const target = createProxyData({
      id: 'deep-body',
      response: createResponse({
        content: JSON.stringify({
          filler: 'x'.repeat(500),
          marker: 'DEEPBODYTOKEN',
        }),
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'DEEPBODYTOKEN')

    expect(results.map((result) => result.id)).toContain('deep-body')
  })

  it('matches a token deep inside a long header value, ignoring its location', () => {
    const target = createProxyData({
      id: 'deep-header',
      request: createRequest({
        headers: [['x-trace', 'x'.repeat(200) + 'DEEPHEADERTOKEN']],
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'DEEPHEADERTOKEN')

    expect(results.map((result) => result.id)).toContain('deep-header')
  })

  it('decodes base64-encoded bodies before searching', () => {
    const target = createProxyData({
      id: 'base64-body',
      request: createRequest({
        method: 'POST',
        content: Buffer.from('{"secret":"BASE64DECODEDTOKEN"}').toString(
          'base64'
        ),
      }),
    })
    const other = createProxyData({ id: 'other' })

    const results = searchRequests([target, other], 'BASE64DECODEDTOKEN')

    expect(results.map((result) => result.id)).toContain('base64-body')
  })

  it('still matches by url, method, and host', () => {
    const requests = [
      createProxyData({
        id: 'login',
        request: createRequest({
          url: 'http://example.com/api/login',
          path: '/api/login',
        }),
      }),
    ]

    expect(searchRequests(requests, 'login').map((r) => r.id)).toContain(
      'login'
    )
    expect(searchRequests(requests, 'GET').map((r) => r.id)).toContain('login')
    expect(searchRequests(requests, 'example.com').map((r) => r.id)).toContain(
      'login'
    )
  })

  it('excludes static asset responses', () => {
    const staticAsset = createProxyData({
      id: 'static',
      request: createRequest({
        url: 'http://example.com/assets/UNIQUESTATICMARKER.png',
        path: '/assets/UNIQUESTATICMARKER.png',
      }),
      response: createResponse({
        headers: [['content-type', 'image/png']],
        content: '',
      }),
    })

    const results = searchRequests([staticAsset], 'UNIQUESTATICMARKER')

    expect(results).toHaveLength(0)
  })

  it('caps results at the provided limit', () => {
    const requests = Array.from({ length: 10 }, (_, index) =>
      createProxyData({
        id: `req-${index}`,
        request: createRequest({
          url: 'http://example.com/api/search',
          path: '/api/search',
        }),
      })
    )

    const results = searchRequests(requests, 'search', 3)

    expect(results).toHaveLength(3)
  })

  it('returns only id, method, url, and statusCode', () => {
    const results = searchRequests(
      [createProxyData({ id: 'shape' })],
      'example'
    )

    expect(results[0]).toEqual({
      id: 'shape',
      method: 'GET',
      url: 'http://example.com',
      statusCode: 200,
    })
  })
})
