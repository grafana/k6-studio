import { useEffect } from 'react'

export function useSaveRequested(callback: () => void) {
  useEffect(() => {
    return window.studio.app.onSaveRequested(callback)
  }, [callback])
}
