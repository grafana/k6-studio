import { useCallback, useEffect, useState } from 'react'

import { K6Log } from '@/types'

export function useRunLogs() {
  const [logs, setLogs] = useState<K6Log[]>([])

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
