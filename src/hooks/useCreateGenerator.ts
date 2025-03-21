import log from 'electron-log/renderer'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

export function useCreateGenerator() {
  const navigate = useNavigate()
  const showToast = useToast()

  const createTestGenerator = useCallback(
    async (recordingPath = '') => {
      try {
        const fileName =
          await window.studio.generator.createGenerator(recordingPath)

        navigate(
          getRoutePath('generator', { fileName: encodeURIComponent(fileName) })
        )
      } catch (error) {
        showToast({
          status: 'error',
          title: 'Failed to create generator',
        })
        log.error(error)
      }
    },
    [navigate, showToast]
  )

  return createTestGenerator
}
