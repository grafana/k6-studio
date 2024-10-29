import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { useState, useMemo } from 'react'

export function useFilterRequests({
  proxyData,
  includeStaticAssets = true,
}: {
  proxyData: ProxyData[]
  includeStaticAssets?: boolean
}) {
  const [filter, setFilter] = useState('')

  const requestWithoutStaticAssets = useMemo(
    () => proxyData.filter(isNonStaticAssetResponse),
    [proxyData]
  )

  const filteredRequests = useMemo(() => {
    const assetsFiltered = includeStaticAssets
      ? proxyData
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
  }, [proxyData, filter, requestWithoutStaticAssets, includeStaticAssets])

  const staticAssetCount = useMemo(
    () => proxyData.length - requestWithoutStaticAssets.length,
    [proxyData.length, requestWithoutStaticAssets.length]
  )

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
  }
}
