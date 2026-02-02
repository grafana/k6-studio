import { useCallback, useEffect, useState } from 'react'

import { BrowserReplayEvent } from '@/main/runner/schema'

export function useBrowserReplay() {
  const [browserReplay, setBrowserReplay] = useState<BrowserReplayEvent[]>([])

  useEffect(() => {
    return window.studio.script.onBrowserReplay((events) => {
      setBrowserReplay((existing) => [...existing, ...events])
    })
  }, [])

  const resetBrowserReplay = useCallback(() => {
    setBrowserReplay([])
  }, [])

  return { browserReplay, resetBrowserReplay }
}
