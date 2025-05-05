import { useMemo } from 'react'

import { selectFilteredRequests } from '../selectors'
import { useGeneratorStore } from '../useGeneratorStore'

export function useOriginalRequest(id?: string) {
  const requests = useGeneratorStore(selectFilteredRequests)

  return useMemo(() => {
    if (!id) {
      return
    }
    return requests.find((request) => request.id === id)?.request
  }, [id, requests])
}
