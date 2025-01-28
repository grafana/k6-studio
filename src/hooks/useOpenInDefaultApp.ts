import { useCallback } from 'react'

import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

export function useOpenInDefaultApp(file: StudioFile) {
  const showToast = useToast()

  return useCallback(async () => {
    try {
      // shell.openPath returns a promise that resolves into an empty string on success
      // and an error message on failure
      const error = await window.studio.ui.openFileInDefaultApp(file)

      if (error) {
        throw new Error(error)
      }
    } catch (error) {
      showToast({
        title: `Failed to open file`,
        status: 'error',
      })
    }
  }, [showToast, file])
}
