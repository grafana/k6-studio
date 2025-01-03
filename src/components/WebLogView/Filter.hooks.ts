import { ProxyData } from '@/types'
import { safeAtob } from '@/utils/format'
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
    console.log('assetsToFilter', assetsToFilter)
    return new Fuse(assetsToFilter, {
      includeMatches: true,
      shouldSort: false,
      useExtendedSearch: true,

      keys: [
        'request.path',
        'request.host',
        'request.method',
        'response.statusCode',
        'request.cookies',
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
          name: 'request.headers.value',
          getFn: (data) => data.request.headers.map(([, value]) => value),
        },
        {
          name: 'request.headers.key',
          getFn: (data) => data.request.headers.map(([key]) => key),
        },
        {
          name: 'response.headers.value',
          getFn: (data) =>
            data.response?.headers.map(([, value]) => value) ?? '',
        },
        {
          name: 'response.headers.key',
          getFn: (data) => data.response?.headers.map(([key]) => key) ?? '',
        },
        // TODO: might need to do the same as headers to show nice previews as well as higlights in Details..
        // TODO: might need to rollback refactor of Details state because it achived nothing

        // {
        // name: 'request.cookies.value',
        // getFn: (data) => data.request.cookies.map(([, value]) => value),
        // },
        // {
        // name: 'response.cookies.value',
        // getFn: (data) =>
        // data.response?.cookies.map(([, value]) => value) ?? '',
        // },
      ],
    })
  }, [assetsToFilter])

  // TODO: skip single char queries
  const filteredRequests = useMemo(() => {
    if (debouncedFilter.match(/^\s*$/) || debouncedFilter.length < 2) {
      return assetsToFilter
    }

    // Use '<query>' to search for exact matches
    return searchIndex.search(`'"${debouncedFilter}"`).map(withMatches)
  }, [searchIndex, assetsToFilter, debouncedFilter])

  const staticAssetCount = proxyData.length - requestWithoutStaticAssets.length

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
  }
}
