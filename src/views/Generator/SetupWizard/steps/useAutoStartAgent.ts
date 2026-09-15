import { useEffect, useRef } from 'react'

import { StepState } from '../state/types'

/**
 * Auto-starts the agent once when the step has not run yet and stops it on
 * unmount.
 */
export function useAutoStartAgent(
  status: StepState['status'],
  start: () => void,
  stop: () => void
) {
  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (hasAutoStarted.current || status !== 'not-started') {
      return
    }

    hasAutoStarted.current = true
    start()
    // The ref guard makes this a mount-only auto-start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
