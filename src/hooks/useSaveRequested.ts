import { useEffect } from 'react'

import type { SaveRequestedPayload } from '@/handlers/app/preload'

export function useSaveRequested(
  callback: (payload: SaveRequestedPayload | undefined) => void
) {
  useEffect(() => {
    return window.studio.app.onSaveRequested(callback)
  }, [callback])
}
