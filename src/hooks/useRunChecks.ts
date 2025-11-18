import { useCallback, useEffect, useState } from 'react'

import { Check } from '@/schemas/k6'

export function useRunChecks() {
  const [checks, setChecks] = useState<Check[]>([])

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
