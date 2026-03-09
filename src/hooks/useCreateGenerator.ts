import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'

export function useCreateGenerator() {
  const navigate = useNavigate()

  const createTestGenerator = useCallback(
    (recordingPath = '') => {
      const url = recordingPath
        ? `${getRoutePath('newGenerator')}?recording=${encodeURIComponent(recordingPath)}`
        : getRoutePath('newGenerator')

      navigate(url)
    },
    [navigate]
  )

  return createTestGenerator
}
