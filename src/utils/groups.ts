import { groupBy } from 'lodash-es'

import { DEFAULT_GROUP_NAME } from '@/constants'

export function groupProxyData<T extends { group?: string }>(requests: T[]) {
  return groupBy(requests, (item) => item.group || DEFAULT_GROUP_NAME)
}
