import { groupProxyData } from '@/utils/groups'
import { RecorderStore } from './useRecorderStore'

export function selectGroupedProxyData(state: RecorderStore) {
  return groupProxyData(state.proxyData)
}
