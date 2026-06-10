import log from 'electron-log/renderer'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

export const SETUP_MODE_SEARCH = 'mode=setup'

interface CreateGeneratorOptions {
  mode?: 'setup'
}

export function useCreateGenerator() {
  const navigate = useNavigate()
  const showToast = useToast()

  const createTestGenerator = useCallback(
    async (recordingPath = '', { mode }: CreateGeneratorOptions = {}) => {
      try {
        const fileName =
          await window.studio.generator.createGenerator(recordingPath)

        navigate({
          pathname: getViewPath(fileName),
          search: mode === 'setup' ? SETUP_MODE_SEARCH : undefined,
        })
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
