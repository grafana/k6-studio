import { useQuery } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Script } from '@/handlers/cloud/types'
import { useBrowserSession } from '@/hooks/useBrowserSession'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'

import { DebuggerState } from './types'

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

export function useDebugSession(script: Script) {
  const [state, setState] = useState<DebuggerState>('pending')
  const [sessionId, setSessionId] = useState(nanoid)

  const { proxyData, resetProxyData } = useListenProxyData()
  const { logs, resetLogs } = useRunLogs()
  const { checks, resetChecks } = useRunChecks()

  const { browserSession, resetBrowserSession } = useBrowserSession()

  const input = script.type === 'file' ? script.path : script.content

  const resetSession = useCallback(() => {
    setSessionId(nanoid())

    resetProxyData()
    resetBrowserSession()
    resetLogs()
    resetChecks()
  }, [resetChecks, resetLogs, resetProxyData, resetBrowserSession])

  const startDebugging = useCallback(async () => {
    setState('running')

    resetSession()

    if (script.type === 'raw') {
      await window.studio.script.runScriptFromGenerator(input).catch(() => {
        setState('stopped')
      })
      return
    }

    await window.studio.script.runScript(input).catch(() => {
      setState('stopped')
    })
  }, [resetSession, script.type, input])

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
      browser: browserSession,
      logs,
      checks,
    }
  }, [sessionId, state, checks, logs, proxyData, browserSession])

  return {
    session,
    startDebugging,
    stopDebugging,
  }
}
