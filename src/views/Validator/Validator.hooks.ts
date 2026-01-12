import { useQuery } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useBrowserActions } from '@/hooks/useBrowserActions'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'

import { DebuggerState } from './types'

export function useScriptPath() {
  const { fileName } = useParams()

  invariant(fileName, 'fileName param is required')

  return fileName
}

export function useScript(fileName: string) {
  return useQuery({
    queryKey: ['script', fileName],
    queryFn: async () => {
      return window.studio.script.openScript(fileName)
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  })
}

type UseDebugSessionParams =
  | {
      type: 'file'
      scriptPath: string
    }
  | {
      type: 'code'
      scriptCode: string
    }

export function useDebugSession(params: UseDebugSessionParams) {
  const [state, setState] = useState<DebuggerState>('pending')
  const [sessionId, setSessionId] = useState(nanoid)

  const { proxyData, resetProxyData } = useListenProxyData()
  const { logs, resetLogs } = useRunLogs()
  const { checks, resetChecks } = useRunChecks()
  const { browserActions, resetBrowserActions } = useBrowserActions()
  const scriptInput =
    params.type === 'file' ? params.scriptPath : params.scriptCode

  const resetSession = useCallback(() => {
    setSessionId(nanoid())

    resetProxyData()
    resetBrowserActions()
    resetLogs()
    resetChecks()
  }, [resetChecks, resetLogs, resetProxyData, resetBrowserActions])

  // Reset session when script or script path changes.
  useEffect(() => {
    setState('pending')
    resetSession()
  }, [scriptInput, resetSession])

  const startDebugging = useCallback(async () => {
    setState('running')

    resetSession()

    if (params.type === 'code') {
      await window.studio.script
        .runScriptFromGenerator(scriptInput)
        .catch(() => {
          setState('stopped')
        })
      return
    }

    await window.studio.script.runScript(scriptInput).catch(() => {
      setState('stopped')
    })
  }, [resetSession, params.type, scriptInput])

  const stopDebugging = useCallback(() => {
    window.studio.script.stopScript()

    setState('stopped')

    return Promise.resolve()
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      setState('stopped')
    })
  }, [])

  const session = useMemo(() => {
    return {
      id: sessionId,
      state,
      requests: proxyData,
      browserActions,
      logs,
      checks,
    }
  }, [sessionId, state, checks, logs, proxyData, browserActions])

  return {
    session,
    startDebugging,
    stopDebugging,
  }
}
