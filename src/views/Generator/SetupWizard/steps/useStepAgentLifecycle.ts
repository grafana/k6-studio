import { useEffect, useRef } from 'react'

import { AgentRunStatus } from '@/utils/assistant/useAssistantAgent'

import { useSetupWizard } from '../state/SetupWizardContext'
import { StepId } from '../state/types'

interface UseStepAgentLifecycleOptions {
  stepId: StepId
  status: AgentRunStatus
  /**
   * Called once the agent reaches the `completed` status. Implementations read
   * their result payload from refs and dispatch the completion action.
   */
  onCompleted: () => void
  failureMessage: string
  /**
   * Set when the step deliberately terminated itself (e.g. skip) in the same
   * commit that unmounts it, where the status ref cannot resync. Suppresses the
   * unmount abort so a just-completed step is not clobbered back to `aborted`.
   */
  terminatedRef?: { current: boolean }
}

/**
 * Maps agent status transitions onto the wizard reducer: completed runs the
 * step's own completion handler, errors and aborts dispatch the matching action.
 */
export function useStepAgentLifecycle({
  stepId,
  status,
  onCompleted,
  failureMessage,
  terminatedRef,
}: UseStepAgentLifecycleOptions) {
  const { state, dispatch } = useSetupWizard()

  // Latest reducer status for this step, read by the unmount cleanup below
  // (which captures values from its setup render and would otherwise go stale).
  const stepStatusRef = useRef(state.steps[stepId].status)
  useEffect(() => {
    stepStatusRef.current = state.steps[stepId].status
  })

  useEffect(() => {
    // Skipping a step completes it while the agent is still shutting down;
    // the trailing abort/error transition must not clobber that state.
    if (state.steps[stepId].status !== 'running') {
      return
    }

    if (status === 'completed') {
      onCompleted()
      return
    }

    if (status === 'error') {
      dispatch({ type: 'stepRunFailed', stepId, message: failureMessage })
    }

    if (status === 'aborted') {
      dispatch({ type: 'stepRunAborted', stepId })
    }
    // Only react to status transitions; the completion payload is read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Navigating away mid-run unmounts the step before the status effect can map
  // the abort onto the reducer, leaving it stuck 'running' and unrecoverable on
  // return. Reconcile here so the step comes back as 'aborted' (re-runnable).
  useEffect(() => {
    return () => {
      // Reading the latest ref values at unmount is the intent here, not a
      // stale-capture bug: stepStatusRef holds the live status and terminatedRef
      // flags a deliberate skip in the same commit.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (stepStatusRef.current === 'running' && !terminatedRef?.current) {
        dispatch({ type: 'stepRunAborted', stepId })
      }
    }
  }, [dispatch, stepId, terminatedRef])
}
