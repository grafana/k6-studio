import {
  UsageEventName,
  WizardStepOutcome,
} from '@/services/usageTracking/types'

import { WizardStep } from '../state/types'

export function trackStepStarted(stepId: WizardStep) {
  window.studio.app.trackEvent({
    event: UsageEventName.TestSetupWizardStepStarted,
    payload: { step: stepId },
  })
}

export function trackStepFinished(
  stepId: WizardStep,
  outcome: WizardStepOutcome,
  durationMs?: number
) {
  window.studio.app.trackEvent({
    event: UsageEventName.TestSetupWizardStepFinished,
    payload: { step: stepId, outcome, durationMs },
  })
}
