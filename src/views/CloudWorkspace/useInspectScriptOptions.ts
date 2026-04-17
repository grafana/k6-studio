import { useEffect, useRef, useState } from 'react'

import { K6TestOptions } from '@/utils/k6/schema'

const DEBOUNCE_MS = 400

/**
 * Runs `k6 inspect` on script text (debounced after edits) so the debugger can
 * choose browser vs protocol layout.
 */
export function useInspectScriptOptions(source: string, resetKey: string) {
  const [inspectedOptions, setInspectedOptions] =
    useState<K6TestOptions | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    isFirstRun.current = true
    setInspectedOptions(null)
  }, [resetKey])

  useEffect(() => {
    let cancelled = false
    const delay = isFirstRun.current ? 0 : DEBOUNCE_MS
    isFirstRun.current = false

    const t = window.setTimeout(() => {
      void window.studio.script.inspectScript(source).then(
        (o) => {
          if (!cancelled) {
            setInspectedOptions(o)
          }
        },
        () => {
          if (!cancelled) {
            setInspectedOptions({})
          }
        }
      )
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [source])

  return {
    options: inspectedOptions,
    optionsReady: inspectedOptions !== null,
  }
}
