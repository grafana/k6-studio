import { useEffect, useRef } from 'react'

import { useSetupWizard } from '../state/SetupWizardContext'
import { StepId } from '../state/types'

/**
 * Reconciles a step's reducer status on unmount. A run left mid-flight (the user
 * navigates away) comes back 'aborted' (recoverable) instead of stuck 'running'
 * and silently re-run on return.
 *
 * Returns a ref the caller sets to `true` when the step deliberately terminates
 * itself in the same commit that unmounts it (e.g. skip), so the completion is
 * not clobbered back to 'aborted'. The ref re-arms whenever the step runs again.
 */
export function useAbortStepOnUnmount(stepId: StepId): { current: boolean } {
  const { state, dispatch } = useSetupWizard()

  const status = state.steps[stepId].status
  // Synced after commit (not during render) so the unmount cleanup reads the
  // last committed status, never a value from a discarded concurrent render.
  const statusRef = useRef(status)
  const terminatedRef = useRef(false)

  useEffect(() => {
    statusRef.current = status
    // A fresh run re-arms the abort that a prior skip suppressed.
    if (status === 'running') {
      terminatedRef.current = false
    }
  })

  useEffect(() => {
    return () => {
      if (statusRef.current === 'running' && !terminatedRef.current) {
        dispatch({ type: 'stepRunAborted', stepId })
      }
    }
  }, [dispatch, stepId])

  return terminatedRef
}
