import {
  UsageEventName,
  WizardStepOutcome,
} from '@/services/usageTracking/types'

import { StepId } from '../state/types'

export function trackStepStarted(stepId: StepId) {
  window.studio.app.trackEvent({
    event: UsageEventName.TestSetupWizardStepStarted,
    payload: { step: stepId },
  })
}

export function trackStepFinished(
  stepId: StepId,
  outcome: WizardStepOutcome,
  durationMs?: number
) {
  window.studio.app.trackEvent({
    event: UsageEventName.TestSetupWizardStepFinished,
    payload: { step: stepId, outcome, durationMs },
  })
}
