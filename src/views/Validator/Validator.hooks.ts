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

type DebuggerState = 'pending' | 'running' | 'stopped'

export function useDebugSession(scriptPath: string) {
  const [state, setState] = useState<DebuggerState>('pending')

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
    setState('pending')
    resetSession()
  }, [scriptPath, resetSession])

  const startDebugging = useCallback(async () => {
    setState('running')

    resetSession()

    await window.studio.script.runScript(scriptPath).catch(() => {
      setState('stopped')
    })
  }, [scriptPath, resetSession])

  const stopDebugging = useCallback(() => {
    window.studio.script.stopScript()

    setState('stopped')

    return Promise.resolve()
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptStopped(() => {
      setState('stopped')
    })
  }, [])

  const session = useMemo(() => {
    return {
      running: state === 'running',
      requests: proxyData,
      browserActions,
      logs,
      checks,
    }
  }, [state, checks, logs, proxyData, browserActions])

  return {
    session: state !== 'pending' ? session : null,
    startDebugging,
    stopDebugging,
  }
}
