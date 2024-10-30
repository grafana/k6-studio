import { ProxyData } from '@/types'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
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

  const staticAssetCount = proxyData.length - requestWithoutStaticAssets.length

  return {
    filter,
    setFilter,
    filteredRequests,
    staticAssetCount,
  }
}
