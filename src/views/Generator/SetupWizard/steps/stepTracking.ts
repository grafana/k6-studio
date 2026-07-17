import { useRef } from 'react'

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

/**
 * Owns the started/finished event pair for one step run, whatever drives the
 * run (useStepAgent's assistant agent or the embedded AutoCorrelation flow).
 * durationMs is measured from trackStarted and omitted when the run is
 * reconciled without one (e.g. unmount).
 */
export function useStepRunTracker(stepId: WizardStep) {
  const startedAtRef = useRef<number | null>(null)

  function trackStarted() {
    trackStepStarted(stepId)
    startedAtRef.current = Date.now()
  }

  function trackFinished(outcome: WizardStepOutcome) {
    trackStepFinished(
      stepId,
      outcome,
      startedAtRef.current === null
        ? undefined
        : Date.now() - startedAtRef.current
    )
  }

  return { trackStarted, trackFinished }
}
