import { useEffect, useMemo } from 'react'
import { Switch, Text } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { Label } from '@/components/Label'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { useLocalStorage } from 'react-use'

export function StaticAssetsFilter({
  proxyData,
  setFilteredProxyData,
}: {
  proxyData: ProxyData[]
  setFilteredProxyData: (data: ProxyData[]) => void
}) {
  const [includeStaticAssets, setIncludeStaticAssets] = useLocalStorage(
    'includeStaticAssets',
    false
  )

  const requestsWithoutStaticAssets = useMemo(
    () => proxyData.filter(isNonStaticAssetResponse),
    [proxyData]
  )

  const staticAssetCount = useMemo(
    () => proxyData.length - requestsWithoutStaticAssets.length,
    [proxyData.length, requestsWithoutStaticAssets.length]
  )

  useEffect(() => {
    if (includeStaticAssets) {
      setFilteredProxyData(proxyData)
      return
    }

    setFilteredProxyData(requestsWithoutStaticAssets)
  }, [
    includeStaticAssets,
    proxyData,
    requestsWithoutStaticAssets,
    setFilteredProxyData,
  ])

  if (staticAssetCount === 0) {
    return null
  }

  return (
    <Label>
      <Text size="2">Show static assets ({staticAssetCount})</Text>
      <Switch
        onCheckedChange={() => setIncludeStaticAssets(!includeStaticAssets)}
        checked={includeStaticAssets}
      />
    </Label>
  )
}
