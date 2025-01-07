import { ProxyData } from '@/types'
import { safeAtob } from '@/utils/format'
import { withMatches } from '@/utils/fuse'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import Fuse from 'fuse.js'
import { useState, useMemo } from 'react'
import { useDebounce } from 'react-use'
import { parseParams } from './RequestDetails/utils'

export function useFilterRequests({
  proxyData,
  includeStaticAssets = true,
}: {
  proxyData: ProxyData[]
  includeStaticAssets?: boolean
}) {
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState(filter)

  const requestWithoutStaticAssets = useMemo(
    () => proxyData.filter(isNonStaticAssetResponse),
    [proxyData]
  )

  const assetsToFilter = includeStaticAssets
    ? proxyData
    : requestWithoutStaticAssets

  useDebounce(
    () => {
      setDebouncedFilter(filter)
    },
    300,
    [filter]
  )

  const searchIndex = useMemo(() => {
    return new Fuse(assetsToFilter, {
      includeMatches: true,
      shouldSort: false,
      useExtendedSearch: true,

      keys: [
        'request.path',
        'request.host',
        'request.method',
        'request.cookies',
        'request.headers',
        'request.query',
        'response.cookies',
        'response.headers',
        'response.statusCode',
        {
          name: 'response.content',
          getFn: (data) => {
            if (!data.response) {
              return ''
            }

            return safeAtob(data.response.content)
          },
        },
        {
          name: 'request.content',
          getFn: (data) => {
            if (!data.response) {
              return ''
            }

            return parseParams(data) ?? ''
          },
        },
      ],
    })
  }, [assetsToFilter])

  const filteredRequests = useMemo(() => {
    // skip single char queries
    if (debouncedFilter.match(/^\s*$/) || debouncedFilter.length < 2) {
      return assetsToFilter
    }

    // Use '<query> to search for exact matches
    const rez = searchIndex.search(`'"${debouncedFilter}"`)
    console.log('rez', rez)
    return rez.map(withMatches)
  }, [searchIndex, assetsToFilter, debouncedFilter])

  const staticAssetCount = proxyData.length - requestWithoutStaticAssets.length

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
  }
}
