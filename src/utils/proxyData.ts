import { ProxyData } from '@/types'
import {
  mergeRequestsById,
  findCachedResponse,
} from '@/views/Recorder/Recorder.utils'

/**
 * Process incoming proxy data by handling 304 responses and merging with existing data
 */
export function processProxyData(
  prevData: ProxyData[],
  newData: ProxyData,
  group?: string
): ProxyData[] {
  const processedData =
    newData.response?.statusCode === 304
      ? findCachedResponse(prevData, newData)
      : newData

  return mergeRequestsById(prevData, {
    ...processedData,
    group,
  })
}
