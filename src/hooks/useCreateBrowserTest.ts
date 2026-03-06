import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

export function useCreateBrowserTest() {
  const showToast = useToast()
  const navigate = useNavigate()

  return useCallback(async () => {
    try {
      const filePath = await window.studio.browserTest.create()

      navigate(
        getRoutePath('editorView', {
          path: encodeURIComponent(filePath),
        })
      )
    } catch {
      showToast({
        status: 'error',
        title: 'Failed to create browser test',
      })
    }
  }, [navigate, showToast])
}
