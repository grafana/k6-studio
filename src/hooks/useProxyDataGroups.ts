import { useMemo } from 'react'

import { DEFAULT_GROUP_NAME } from '@/constants'
import { ProxyData } from '@/types'

/** Returns an array of unique group names from the given proxy data */
export function useProxyDataGroups(proxyData: ProxyData[]) {
  return useMemo(() => {
    const names = new Set(
      proxyData.map((data) => data.group ?? DEFAULT_GROUP_NAME)
    )

    return Array.from(names).map((name) => {
      return {
        id: name,
        // External scripts without groups will have have group=""
        name: name === '' ? DEFAULT_GROUP_NAME : name,
      }
    })
  }, [proxyData])
}
