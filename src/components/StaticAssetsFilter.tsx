import { useEffect, useState } from 'react'
import { Checkbox } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { Label } from '@/components/Label'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function StaticAssetsFilter({
  proxyData,
  setFilteredProxyData,
}: {
  proxyData: ProxyData[]
  setFilteredProxyData: (data: ProxyData[]) => void
}) {
  const [includeStaticAssets, setIncludeStaticAssets] = useState(false)

  useEffect(() => {
    if (includeStaticAssets) {
      setFilteredProxyData(proxyData)
      return
    }
    setFilteredProxyData(proxyData.filter(isNonStaticAssetResponse))
  }, [proxyData, includeStaticAssets, setFilteredProxyData])

  return (
    <Label>
      Show static assets
      <Checkbox
        onCheckedChange={() => setIncludeStaticAssets((val) => !val)}
        checked={includeStaticAssets}
      />
    </Label>
  )
}
