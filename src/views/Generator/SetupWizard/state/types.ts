import { ActionLogEntry } from '@/components/Assistant/types'
import { WizardStep } from '@/services/usageTracking/types'
import { SuggestedRuleEntry } from '@/views/Generator/AutoCorrelation/types'

// The step list lives with the usage-event types so the analytics payloads
// stay precisely typed without importing view code into the services layer.
// Re-exported here as the wizard's import point for it.
export { WIZARD_STEPS } from '@/services/usageTracking/types'
export type { WizardStep }

export type HostCategory =
  | 'application'
  | 'api'
  | 'auth'
  | 'cdn'
  | 'analytics'
  | 'other'

export interface HostSuggestion {
  host: string
  category: HostCategory
  suggested: boolean
  reason: string
  requestCount: number
}

export interface ParamSuggestionMeta {
  ruleId: string
  field: string
  location: {
    method: string
    path: string
    in: 'body' | 'query' | 'headers' | 'url'
  }
  recordedValue: string
}

export type StepResult =
  | { step: 'hosts'; suggestions: HostSuggestion[] }
  | { step: 'autocorrelation'; entries: SuggestedRuleEntry[] }
  | {
      step: 'parameterization'
      suggestions: ParamSuggestionMeta[]
      /** Variables this run created, so re-run cleanup deletes only those. */
      addedVariableNames: string[]
    }
  | {
      step: 'thresholds'
      rationaleById: Record<string, string>
      /**
       * Ids of thresholds the generator had before the step committed. The
       * step only shows and withdraws rows outside this set.
       */
      preexistingIds: string[]
    }

/** What a finished run leaves behind, whether it ran or was skipped. */
export interface StepOutcome {
  result: StepResult
  log: ActionLogEntry[]
  summary: string
}

export type StepState =
  | { status: 'not-started' }
  | { status: 'running' }
  | { status: 'error'; message: string }
  | { status: 'aborted' }
  | ({ status: 'completed' } & StepOutcome)
  | ({ status: 'skipped' } & StepOutcome)

/**
 * A step in a terminal, advanceable state. Completed and skipped steps behave
 * the same everywhere (navigation, withdrawal, re-run); they differ only in
 * how they got there.
 */
export type DoneStep = Extract<StepState, { status: 'completed' | 'skipped' }>

export function isStepDone(step: StepState): step is DoneStep {
  return step.status === 'completed' || step.status === 'skipped'
}

export interface WizardState {
  screen: 'choice' | 'wizard'
  activeStep: WizardStep
  steps: Record<WizardStep, StepState>
}

export type WizardAction =
  | { type: 'startWizard' }
  | { type: 'goToStep'; stepId: WizardStep }
  | { type: 'stepRunStarted'; stepId: WizardStep }
  | ({ type: 'stepRunCompleted'; stepId: WizardStep } & StepOutcome)
  | ({ type: 'stepRunSkipped'; stepId: WizardStep } & StepOutcome)
  | { type: 'stepRunFailed'; stepId: WizardStep; message: string }
  | { type: 'stepRunAborted'; stepId: WizardStep }
  | { type: 'invalidateStepsAfter'; stepId: WizardStep }
  | { type: 'stepRunReset'; stepId: WizardStep }
  | { type: 'back' }
  | { type: 'continue' }
