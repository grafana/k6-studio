import { ProxyData } from '@/types'
import { withMatches } from '@/utils/fuse'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import Fuse from 'fuse.js'
import { useState, useMemo } from 'react'
import { useDebounce } from 'react-use'

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
      threshold: 0.2,

      keys: [
        'request.path',
        'request.host',
        'request.method',
        'response.statusCode',
      ],
    })
  }, [assetsToFilter])

  const filteredRequests = useMemo(() => {
    if (debouncedFilter.match(/^\s*$/)) {
      return assetsToFilter
    }

    return searchIndex.search(debouncedFilter).map(withMatches)
  }, [searchIndex, assetsToFilter, debouncedFilter])

  const staticAssetCount = proxyData.length - requestWithoutStaticAssets.length

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
  }
}
