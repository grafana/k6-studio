import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useListenProxyData } from './useListenProxyData'
import { ProxyData } from '@/types'

type Callback = (data: ProxyData) => void

describe('useListenProxyData', () => {
  let callback: Callback
  beforeAll(() => {
    vi.stubGlobal('studio', {
      proxy: {
        onProxyData: (cb: Callback) => {
          callback = cb
        },
      },
    })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('merges proxy data by id', () => {
    const { result } = renderHook(() => useListenProxyData())

    act(() => {
      callback(proxyDataWithoutResponse)
      callback(proxyDataWithResponse)
    })

    expect(result.current.proxyData).toEqual([proxyDataWithResponse])
  })

  it('accepts group', () => {
    const { result, rerender } = renderHook(useListenProxyData, {
      initialProps: 'group_1',
    })

    act(() => {
      callback(proxyDataWithoutResponse)
      callback(proxyDataWithResponse)
    })

    rerender('group_2')

    act(() => {
      callback({ ...proxyDataWithoutResponse, id: '2' })
      callback({ ...proxyDataWithResponse, id: '2' })
    })

    expect(result.current.proxyData).toEqual([
      {
        ...proxyDataWithResponse,
        group: 'group_1',
      },

      {
        ...proxyDataWithResponse,
        group: 'group_2',
        id: '2',
      },
    ])
  })

  // Events emitted from k6 script execution have group as a comment field, but it's only present in the request
  it('uses comment as group ', () => {
    const { result } = renderHook(() => useListenProxyData())

    act(() => {
      callback({
        ...proxyDataWithResponse,
        comment: 'group_2',
      })
      callback(proxyDataWithResponse)
    })

    expect(result.current.proxyData).toEqual([
      {
        ...proxyDataWithResponse,
        group: 'group_2',
      },
    ])
  })

  it('updates content and headers of a 304 response', () => {
    const { result } = renderHook(() => useListenProxyData())

    act(() => {
      callback(proxyDataWithResponse)
      callback({ ...proxyDataWith304Response, id: '2' })
    })

    const expectedResponse = {
      ...proxyDataWith304Response.response,
      statusCode: 304,
      content: proxyDataWithResponse.response?.content,
      headers: [
        proxyDataWithResponse.response?.headers.find(
          ([key]) => key === 'content-type'
        ),
      ],
    }

    expect(result.current.proxyData[1]?.response).toEqual(expectedResponse)
  })
})

const request: ProxyData['request'] = {
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
}

const response: ProxyData['response'] = {
  statusCode: 200,
  headers: [['content-type', 'application/json']],
  cookies: [],
  reason: 'OK',
  content: '{"hello":"world"}',
  path: '/api/v1/users',
  httpVersion: '1.1',
  timestampStart: 0,
  contentLength: 0,
}

const proxyDataWithoutResponse: ProxyData = {
  id: '1',
  request,
}

const proxyDataWithResponse: ProxyData = {
  id: '1',
  request,
  response,
}

const proxyDataWith304Response: ProxyData = {
  ...proxyDataWithResponse,
  request,
  response: {
    ...response,
    statusCode: 304,
    content: '',
    headers: [],
  },
}
