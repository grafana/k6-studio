import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { useState, useMemo } from 'react'
import { useLocalStorage } from 'react-use'

export function useFilterRequests(requests: ProxyData[]) {
  const [filter, setFilter] = useState('')
  const [includeStaticAssets, setIncludeStaticAssets] = useLocalStorage(
    'includeStaticAssets',
    false
  )

  const requestWithoutStaticAssets = useMemo(
    () => requests.filter(isNonStaticAssetResponse),
    [requests]
  )

  const filteredRequests = useMemo(() => {
    const assetsFiltered = includeStaticAssets
      ? requests
      : requestWithoutStaticAssets
    const lowerCaseFilter = filter.toLowerCase().trim()
    if (lowerCaseFilter === '') return assetsFiltered

    return assetsFiltered.filter((data) => {
      return (
        data.request.url.toLowerCase().includes(lowerCaseFilter) ||
        data.request.method.toLowerCase().includes(lowerCaseFilter) ||
        data.response?.statusCode.toString().includes(lowerCaseFilter)
      )
    })
  }, [requests, filter, requestWithoutStaticAssets, includeStaticAssets])

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
