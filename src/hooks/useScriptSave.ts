import { useToast } from '@/store/ui/useToast'
import { useEffect } from 'react'

export function useOnScriptSaveSuccess() {
  const showToast = useToast()

  useEffect(() => {
    return window.studio.script.onScriptSaveSuccess(() => {
      showToast({
        title: 'Script exported successfully',
        status: 'success',
      })
    })
  }, [showToast])
}

export function useOnScriptSaveFailure() {
  const showToast = useToast()

  useEffect(() => {
    return window.studio.script.onScriptSaveFailure(() => {
      showToast({
        title: 'There was an error exporting the script',
        status: 'error',
      })
    })
  }, [showToast])
}
