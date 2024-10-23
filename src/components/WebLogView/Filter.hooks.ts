import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { useState, useMemo } from 'react'
import { useDebounce, useLocalStorage } from 'react-use'

export function useFilterRequests(requests: ProxyData[]) {
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState(filter)

  const [includeStaticAssets, setIncludeStaticAssets] = useLocalStorage(
    'includeStaticAssets',
    false
  )

  const requestWithoutStaticAssets = useMemo(
    () => requests.filter(isNonStaticAssetResponse),
    [requests]
  )

  const assetsToFilter = includeStaticAssets
    ? requests
    : requestWithoutStaticAssets

  useDebounce(
    () => {
      setDebouncedFilter(filter)
    },
    300,
    [filter]
  )

  const filteredRequests = useMemo(() => {
    const lowerCaseFilter = debouncedFilter.toLowerCase().trim()

    if (lowerCaseFilter === '') {
      return assetsToFilter
    }

    return assetsToFilter.filter((data) => {
      return (
        data.request.url.toLowerCase().includes(lowerCaseFilter) ||
        data.request.method.toLowerCase().includes(lowerCaseFilter) ||
        data.response?.statusCode.toString().includes(lowerCaseFilter)
      )
    })
  }, [debouncedFilter, assetsToFilter])

  const staticAssetCount = useMemo(
    () => requests.length - requestWithoutStaticAssets.length,
    [requests.length, requestWithoutStaticAssets.length]
  )

  return {
    filter,
    setFilter,
    filteredRequests,
    includeStaticAssets,
    setIncludeStaticAssets,
    staticAssetCount,
  }
}
