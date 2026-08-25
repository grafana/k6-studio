import { useEffect } from 'react'

import { invalidateAssistantAuthStatus } from '@/hooks/useAssistantAuth'
import { classifyError } from '@/utils/assistant/classifyError'
import { AgentRunStatus } from '@/utils/assistant/useAssistantAgent'

import { useSetupWizard } from '../state/SetupWizardContext'
import { WizardStep } from '../state/types'

interface UseStepAgentLifecycleOptions {
  stepId: WizardStep
  status: AgentRunStatus
  /** The run's failure, used to tell an expired session from a failed analysis. */
  error: Error | undefined
  /**
   * Called once the agent reaches the `completed` status. Implementations read
   * their result payload from refs and dispatch the completion action.
   */
  onCompleted: () => void
  failureMessage: string
  /** Reports the step_finished usage event for error/abort terminals. */
  onFinished: (outcome: 'error' | 'aborted') => void
}

/**
 * Maps agent status transitions onto the wizard reducer: completed runs the
 * step's own completion handler, errors and aborts dispatch the matching action.
 * Unmount reconciliation lives in useAbortStepOnUnmount.
 */
export function useStepAgentLifecycle({
  stepId,
  status,
  error,
  onCompleted,
  failureMessage,
  onFinished,
}: UseStepAgentLifecycleOptions) {
  const { state, dispatch } = useSetupWizard()

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
      onFinished('error')

      // An expired session is not an analysis failure, so re-check auth and let
      // the gate ask for a reconnect. The step keeps its failed state, which is
      // retryable once the user is back. Resetting it here would auto-start a
      // run against the same dead token.
      if (error && classifyError(error.message).category === 'auth-expired') {
        void invalidateAssistantAuthStatus()
      }

      dispatch({ type: 'stepRunFailed', stepId, message: failureMessage })
    }

    if (status === 'aborted') {
      onFinished('aborted')
      dispatch({ type: 'stepRunAborted', stepId })
    }
    // Only react to status transitions; the completion payload is read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}
