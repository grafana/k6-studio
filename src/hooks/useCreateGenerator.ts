import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { generateFileNameWithTimestamp } from '@/utils/file'
import { createNewGeneratorFile } from '@/utils/generator'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import log from 'electron-log/renderer'

export function useCreateGenerator() {
  const navigate = useNavigate()
  const showToast = useToast()

  const createTestGenerator = useCallback(async () => {
    try {
      const newGenerator = createNewGeneratorFile()
      const fileName = await window.studio.generator.saveGenerator(
        JSON.stringify(newGenerator, null, 2),
        generateFileNameWithTimestamp('json', 'Generator')
      )

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
  }, [navigate, showToast])

  return createTestGenerator
}
