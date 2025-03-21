import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest'

import {
  createProxyData,
  createProxyDataWithoutResponse,
  createResponse,
} from '@/test/factories/proxyData'
import { ProxyData } from '@/types'

import { useListenProxyData } from './useListenProxyData'

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

const proxyDataWithResponse = createProxyData()
const proxyDataWithoutResponse = createProxyDataWithoutResponse()
const responseWith304StatusCode = createResponse({
  statusCode: 304,
  content: '',
  headers: [],
})
const proxyDataWith304Response = createProxyData({
  response: responseWith304StatusCode,
})
