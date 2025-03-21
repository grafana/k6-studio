import { useCallback, useEffect, useState } from 'react'

import { K6Check } from '@/types'

export function useRunChecks() {
  const [checks, setChecks] = useState<K6Check[]>([])

  const resetChecks = useCallback(() => {
    setChecks([])
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptCheck((checks) => {
      setChecks(checks)
    })
  }, [])

  return { checks, resetChecks }
}
