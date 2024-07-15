import { ProxyData } from '@/types'
import { groupBy } from 'lodash-es'

export function groupProxyData(requests: ProxyData[]) {
  return groupBy(requests, (item) => item.group || 'Default')
}
