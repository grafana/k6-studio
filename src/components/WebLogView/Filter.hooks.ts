import Fuse, { FuseOptionKey } from 'fuse.js'
import { useState, useMemo } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'

import { ProxyData } from '@/types'
import { withMatches } from '@/utils/fuse'
import { getContentType } from '@/utils/headers'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

import { parseParams } from './RequestDetails/utils'
import { parseContent, toFormat } from './ResponseDetails/ResponseDetails.utils'

export function useFilterRequests({
  proxyData,
  includeStaticAssets = true,
}: {
  proxyData: ProxyData[]
  includeStaticAssets?: boolean
}) {
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState(filter)
  const [filterAllData, setFilterAllData] = useLocalStorage(
    'filterAllData',
    true
  )

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

      keys: filterAllData
        ? [...basicSearchKeys, ...fullSearchKeys]
        : basicSearchKeys,
    })
  }, [assetsToFilter, filterAllData])

  const filteredRequests = useMemo(() => {
    // skip single char queries
    if (debouncedFilter.match(/^\s*$/) || debouncedFilter.length < 2) {
      return assetsToFilter
    }

    // Use '<query> to search for exact matches
    return searchIndex.search(`'"${debouncedFilter}"`).map(withMatches)
  }, [searchIndex, assetsToFilter, debouncedFilter])

  const staticAssetCount = proxyData.length - requestWithoutStaticAssets.length

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
    filterAllData,
    setFilterAllData,
  }
}

const basicSearchKeys: Array<FuseOptionKey<ProxyData>> = [
  'request.path',
  'request.host',
  'request.method',
  'response.statusCode',
  'request.url',
]

const fullSearchKeys: Array<FuseOptionKey<ProxyData>> = [
  'request.cookies',
  'request.headers',
  'request.query',
  'response.cookies',
  'response.headers',
  {
    name: 'response.content',
    getFn: (data) => {
      if (!data.response) {
        return ''
      }

      const contentType = getContentType(data.response?.headers ?? [])
      const format = toFormat(contentType)

      // Skip non-text content
      if (!format || ['audio', 'font', 'image', 'video'].includes(format)) {
        return ''
      }

      return parseContent(format, data) ?? ''
    },
  },
  {
    name: 'request.content',
    getFn: (data) => parseParams(data.request) ?? '',
  },
]
