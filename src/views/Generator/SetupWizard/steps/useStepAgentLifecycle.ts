import { useEffect } from 'react'

import { useGeneratorStore } from '@/store/generator'
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
  onCompleted,
  failureMessage,
  onFinished,
}: UseStepAgentLifecycleOptions) {
  const { state, dispatch } = useSetupWizard()
  const setWizardUsed = useGeneratorStore((store) => store.setWizardUsed)

  useEffect(() => {
    // Skipping a step completes it while the agent is still shutting down;
    // the trailing abort/error transition must not clobber that state.
    if (state.steps[stepId].status !== 'running') {
      return
    }

    if (status === 'completed') {
      // A finished agent step means the wizard actually configured something;
      // opening and closing the wizard, skips, and failures do not count. The
      // flag persists in the generator file and script header for reporting.
      setWizardUsed(true)
      onCompleted()
      return
    }

    if (status === 'error') {
      onFinished('error')
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
