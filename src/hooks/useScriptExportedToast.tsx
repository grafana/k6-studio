import { Button } from '@radix-ui/themes'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'

export function useScriptExportedToast() {
  const showToast = useToast()
  const navigate = useNavigate()

  return useCallback(
    (scriptPath: string) => {
      showToast({
        title: 'Script exported successfully',
        status: 'success',
        action: (
          <Button
            variant="ghost"
            onClick={() => navigate(getViewPath(scriptPath))}
          >
            Open
          </Button>
        ),
      })
    },
    [showToast, navigate]
  )
}
