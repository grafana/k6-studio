import { useCallback, useEffect, useState } from 'react'

import { LogEntry } from '@/schemas/k6'

export function useRunLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const resetLogs = useCallback(() => {
    setLogs([])
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptLog((log) => {
      setLogs((prev) => [...prev, log])
    })
  }, [])

  return { logs, resetLogs }
}
