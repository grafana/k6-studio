import { useCallback } from 'react'
import { useMatch } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
import { UsageEventName } from '@/services/usageTracking/types'

export function useTrackScriptCopy(script: string) {
  const isGenerator = useMatch({ path: getRoutePath('generator') })
  const isValidator = useMatch({ path: getRoutePath('validator') })

  const source =
    isGenerator !== null
      ? 'generator'
      : isValidator !== null
        ? 'validator'
        : 'unknown'

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
