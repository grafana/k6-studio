import { DEFAULT_GROUP_NAME } from '@/constants'
import { ProxyData } from '@/types'
import { groupBy } from 'lodash-es'

export function groupProxyData(requests: ProxyData[]) {
  return groupBy(requests, (item) => item.group || DEFAULT_GROUP_NAME)
}
