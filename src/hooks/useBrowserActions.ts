import { useCallback, useEffect, useState } from 'react'

import { BrowserActionEvent } from '@/main/runner/schema'

export function useBrowserActions() {
  const [browserActions, setBrowserActions] = useState<BrowserActionEvent[]>([])

  useEffect(() => {
    return window.studio.script.onBrowserAction((event) => {
      if (event.type === 'begin') {
        setBrowserActions((actions) => [...actions, event])

        return
      }

      setBrowserActions((actions) =>
        actions.map((action) =>
          action.eventId === event.eventId ? event : action
        )
      )
    })
  }, [])

  const resetBrowserActions = useCallback(() => {
    setBrowserActions([])
  }, [])

  return { browserActions, resetBrowserActions }
}
