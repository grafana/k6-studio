import { ActionLogEntry } from '@/components/Assistant/types'

export const STEP_ORDER = [
  'hosts',
  'autocorrelation',
  'parameterization',
  'thresholds',
] as const

export type StepId = (typeof STEP_ORDER)[number]

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
  confidence: 'high' | 'low'
  secret: boolean
  recordedValue: string
}

export type StepResult =
  | { step: 'hosts'; suggestions: HostSuggestion[] }
  | { step: 'autocorrelation'; ruleIds: string[] }
  | { step: 'parameterization'; suggestions: ParamSuggestionMeta[] }
  | { step: 'thresholds'; rationaleById: Record<string, string> }

export type StepState =
  | { status: 'not-started' }
  | { status: 'running' }
  | { status: 'error'; message: string }
  | { status: 'aborted' }
  | {
      status: 'completed'
      result: StepResult
      log: ActionLogEntry[]
      summary: string
    }

export interface WizardState {
  screen: 'choice' | 'wizard'
  activeStep: StepId
  steps: Record<StepId, StepState>
}

export type WizardAction =
  | { type: 'startWizard' }
  | { type: 'goToStep'; stepId: StepId }
  | { type: 'stepRunStarted'; stepId: StepId }
  | {
      type: 'stepRunCompleted'
      stepId: StepId
      result: StepResult
      log: ActionLogEntry[]
      summary: string
    }
  | { type: 'stepRunFailed'; stepId: StepId; message: string }
  | { type: 'stepRunAborted'; stepId: StepId }
  | { type: 'stepRunReset'; stepId: StepId }
  | { type: 'back' }
  | { type: 'continue' }
