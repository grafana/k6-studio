import { useCallback } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'

export function useTrackScriptCopy(
  script: string,
  source: 'generator' | 'debugger'
) {
  return useCallback(
    (event: ClipboardEvent) => {
      const copiedText = event.clipboardData?.getData('text/plain')

      if (copiedText?.trim() === script.trim()) {
        window.studio.app.trackEvent({
          event: UsageEventName.ScriptCopied,
          payload: { source },
        })
      }
    },
    [script, source]
  )
}
