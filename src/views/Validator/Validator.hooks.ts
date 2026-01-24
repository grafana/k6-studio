import { useQuery } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { Script } from '@/handlers/cloud/types'
import { useBrowserActions } from '@/hooks/useBrowserActions'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'
import { StudioFile } from '@/types'
import { getStudioFileFromPath } from '@/utils/file'

import { DebuggerState } from './types'

export function useScriptPath() {
  const { fileName } = useParams()

  invariant(fileName, 'fileName param is required')

  return getStudioFileFromPath('script', fileName)
}

export function useScript(file: StudioFile) {
  return useQuery({
    queryKey: ['script', file.filePath],
    queryFn: async () => {
      const result = await window.studio.files.open(file.filePath, 'script')

      if (result === null) {
        throw new Error('Failed to load script')
      }

      if (result.content.type !== 'script') {
        throw new Error(`File is not a valid script.`)
      }

      const analysis = await window.studio.script.analyze(result.location)

      return {
        ...analysis,
        script: result.content.content,
      }
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
  const { browserActions, resetBrowserActions } = useBrowserActions()
  const input = script.type === 'file' ? script.path : script.content

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
  }, [input, resetSession])

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
