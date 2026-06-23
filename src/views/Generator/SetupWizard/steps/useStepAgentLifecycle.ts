import { useEffect } from 'react'

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
}

/**
 * Maps agent status transitions onto the wizard reducer: completed runs the
 * step's own completion handler, errors and aborts dispatch the matching action.
 * Unmount reconciliation lives in useAbortStepOnUnmount.
 */
export function useStepAgentLifecycle({
  stepId,
  status,
  onCompleted,
  failureMessage,
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
      dispatch({ type: 'stepRunFailed', stepId, message: failureMessage })
    }

    if (status === 'aborted') {
      dispatch({ type: 'stepRunAborted', stepId })
    }
    // Only react to status transitions; the completion payload is read from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}
