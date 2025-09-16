import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useBrowserActions } from '@/hooks/useBrowserActions'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'

export function useScriptPath() {
  const { fileName } = useParams()
  // TODO(router): useLocation is not type-safe. Refactor this route to avoid using it.
  const { state } = useLocation() as { state: { externalScriptPath: string } }

  return {
    scriptPath: state?.externalScriptPath ? state.externalScriptPath : fileName,
    isExternal: Boolean(state?.externalScriptPath),
  }
}

export function useDebugSession(scriptPath: string) {
  const [pending, setPending] = useState(true)

  const { proxyData, resetProxyData } = useListenProxyData()
  const { logs, resetLogs } = useRunLogs()
  const { checks, resetChecks } = useRunChecks()
  const { browserActions, resetBrowserActions } = useBrowserActions()

  const resetSession = useCallback(() => {
    resetProxyData()
    resetBrowserActions()
    resetLogs()
    resetChecks()
  }, [resetChecks, resetLogs, resetProxyData, resetBrowserActions])

  // Reset session when script path changes.
  useEffect(() => {
    setPending(true)
    resetSession()
  }, [scriptPath, resetSession])

  const startDebugging = useCallback(async () => {
    setPending(false)

    resetSession()

    await window.studio.script.runScript(scriptPath)
  }, [scriptPath, resetSession])

  const session = useMemo(() => {
    return {
      requests: proxyData,
      browserActions,
      logs,
      checks,
    }
  }, [checks, logs, proxyData, browserActions])

  return {
    pending,
    session,
    startDebugging,
  }
}
