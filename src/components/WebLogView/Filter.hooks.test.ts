import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createProxyData, createRequest } from '@/test/factories/proxyData'
import { ProxyData, ProxyDataWithMatches } from '@/types'

import { useFilterRequests } from './Filter.hooks'

function getMatches(
  filteredRequest: ProxyData | ProxyDataWithMatches | undefined
) {
  if (filteredRequest && 'matches' in filteredRequest) {
    return filteredRequest.matches
  }

  return undefined
}

describe('useFilterRequests', () => {
  it('returns the leaf value for header matches so they can be highlighted in the inspector', async () => {
    const proxyData = [
      createProxyData({
        id: '1',
        request: createRequest({
          headers: [['x-custom-header', 'unique-header-value']],
        }),
      }),
    ]

    const { result } = renderHook(() => useFilterRequests({ proxyData }))

    act(() => {
      result.current.setFilter('unique-header-value')
    })

    await waitFor(() => {
      const matches = getMatches(result.current.filteredRequests[0]) ?? []
      const headerMatches = matches.filter((match) =>
        match.key?.includes('headers')
      )

      // The inspector renders header keys and values separately and highlights
      // a cell when match.value === cell text. The match value must therefore be
      // the leaf value, not the comma-joined "key,value" tuple.
      expect(headerMatches.map((match) => match.value)).toEqual([
        'unique-header-value',
      ])
    })
  })

  it('deduplicates identical matches produced by repeated header names', async () => {
    const proxyData = [
      createProxyData({
        id: '1',
        request: createRequest({
          headers: [
            ['cookie', 'a=1'],
            ['cookie', 'b=2'],
            ['cookie', 'c=3'],
          ],
        }),
      }),
    ]

    const { result } = renderHook(() => useFilterRequests({ proxyData }))

    act(() => {
      result.current.setFilter('cookie')
    })

    await waitFor(() => {
      const matches = getMatches(result.current.filteredRequests[0]) ?? []
      const cookieNameMatches = matches.filter(
        (match) => match.value === 'cookie'
      )

      // Three "cookie" header names produce three identical fuse matches that
      // differ only by array position. Rendering each would repeat the cell text.
      expect(cookieNameMatches).toHaveLength(1)
    })
  })
})
