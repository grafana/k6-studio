import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { DEFAULT_GROUP_NAME } from '@/constants'
import { createProxyData } from '@/test/factories/proxyData'
import { ProxyData } from '@/types'

import { useProxyDataGroups } from './useProxyDataGroups'

describe('useProxyDataGroups', () => {
  it('should return unique group names from proxy data', () => {
    const proxyData: ProxyData[] = [
      createProxyData({ group: 'Group1' }),
      createProxyData({ group: 'Group2' }),
      createProxyData({ group: 'Group1' }),
      createProxyData({ group: 'Group2' }),
      createProxyData({ group: 'Group3' }),
    ]

    const { result } = renderHook(() => useProxyDataGroups(proxyData))

    expect(result.current).toEqual([
      { id: 'Group1', name: 'Group1' },
      { id: 'Group2', name: 'Group2' },
      { id: 'Group3', name: 'Group3' },
    ])
  })

  it('should handle default group names correctly', () => {
    const proxyData: ProxyData[] = [createProxyData({ group: undefined })]

    const { result } = renderHook(() => useProxyDataGroups(proxyData))

    expect(result.current).toEqual([
      { id: DEFAULT_GROUP_NAME, name: DEFAULT_GROUP_NAME },
    ])
  })

  it('should return an empty array when no proxy data is provided', () => {
    const proxyData: ProxyData[] = []

    const { result } = renderHook(() => useProxyDataGroups(proxyData))

    expect(result.current).toEqual([])
  })
})
