import { useCallback, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

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

export function useDebugSession() {
  const { proxyData, resetProxyData } = useListenProxyData()
  const { logs, resetLogs } = useRunLogs()
  const { checks, resetChecks } = useRunChecks()

  const resetSession = useCallback(() => {
    resetProxyData()
    resetLogs()
    resetChecks()
  }, [resetProxyData, resetLogs, resetChecks])

  const session = useMemo(() => {
    return {
      requests: proxyData,
      logs,
      checks,
    }
  }, [checks, logs, proxyData])

  return {
    session,
    resetSession,
  }
}
