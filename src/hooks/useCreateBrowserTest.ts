import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getViewPath } from '@/routeMap'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { useToast } from '@/store/ui/useToast'

export function useCreateBrowserTest() {
  const showToast = useToast()
  const navigate = useNavigate()

  return useCallback(
    async (actions?: AnyBrowserAction[]) => {
      try {
        const fileName = await window.studio.browserTest.create(actions)

        navigate(getViewPath(fileName))
      } catch {
        showToast({
          status: 'error',
          title: 'Failed to create browser test',
        })
      }
    },
    [navigate, showToast]
  )
}
