import { useCallback } from 'react'

import { UsageEventName } from '@/services/usageTracking/types'

export function useTrackScriptCopy(script: string) {
  return useCallback(
    (event: ClipboardEvent) => {
      const copiedText = event.clipboardData?.getData('text/plain')

      if (copiedText?.trim() === script.trim()) {
        window.studio.app.trackEvent({
          event: UsageEventName.ScriptCopied,
        })
      }
    },
    [script]
  )
}
